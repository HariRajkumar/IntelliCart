import json
from app.agents.intent_agent import IntentAgent
from app.agents.role_agent import RoleAgent
from app.agents.query_agent import QueryAgent
from app.agents.formatter_agent import FormatterAgent
from app.database.executor import QueryExecutor
from app.memory.chat_history import MongoChatHistory
from app.utils.logger import logger

class ChatbotService:
    def __init__(self):
        self.intent_agent = IntentAgent()
        self.role_agent = RoleAgent()
        self.query_agent = QueryAgent()
        self.formatter_agent = FormatterAgent()

    async def process_chat(self, user_id: str, user_role: str, prompt: str) -> str:
        logger.info(f"Processing chat for user '{user_id}' with role '{user_role}': '{prompt}'")

        # 1. Website Intent Validation Agent
        intent_res = await self.intent_agent.validate(prompt)
        if not intent_res.get("is_related", True):
            logger.warning(f"Intent validation failed: {intent_res.get('reason')}")
            # Persist the attempt in history
            await MongoChatHistory.add_message(user_id, "user", prompt)
            fallback = "The given prompt is not related to the IntelliCart website."
            await MongoChatHistory.add_message(user_id, "assistant", fallback)
            return fallback

        # 2. Role Authorization Agent
        role_res = await self.role_agent.authorize(user_role, prompt)
        if not role_res.get("is_authorized", True):
            logger.warning(f"Role authorization failed: {role_res.get('reason')}")
            # Persist the attempt in history
            await MongoChatHistory.add_message(user_id, "user", prompt)
            fallback = "The requested operation is restricted for your user role."
            await MongoChatHistory.add_message(user_id, "assistant", fallback)
            return fallback

        # Save user message to chat history immediately
        await MongoChatHistory.add_message(user_id, "user", prompt)

        # 3. MongoDB Query Generation Agent
        query_spec = await self.query_agent.generate(user_id, user_role, prompt)
        logger.info(f"Generated query spec: {query_spec}")

        # 4. MongoDB Query Execution
        query_results = []
        if query_spec.get("operation") != "none":
            try:
                query_spec["user_id"] = user_id
                query_results = await QueryExecutor.execute(query_spec)
                logger.info(f"Executed query. Found {len(query_results)} results.")
            except Exception as e:
                logger.error(f"Failed to execute query: {e}")
                query_results = [{"error": f"Database execution error: {str(e)}"}]

        # 5. Response Formatting Agent
        # Retrieve recent history context (limit 11 since we just appended the current message)
        history_list = await MongoChatHistory.get_history(user_id, limit=11)
        # Exclude the current user message at the end of the history array to avoid duplicate prompt context
        past_history = history_list[:-1] if len(history_list) > 0 else []
        history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in past_history])

        formatted_res = await self.formatter_agent.format(
            user_prompt=prompt,
            query=json.dumps(query_spec),
            results=json.dumps(query_results),
            chat_history=history_str
        )

        # 6. Save assistant response to history
        await MongoChatHistory.add_message(user_id, "assistant", formatted_res)

        return formatted_res
