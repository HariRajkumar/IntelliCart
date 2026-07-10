from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from app.prompts.formatter_prompt import FORMATTER_PROMPT_TEMPLATE
from app.utils.config import settings
from app.utils.logger import logger

class FormatterAgent:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=0.7
        )
        self.prompt = PromptTemplate(
            input_variables=["user_prompt", "query", "results", "chat_history"],
            template=FORMATTER_PROMPT_TEMPLATE
        )
        self.chain = self.prompt | self.llm

    async def format(self, user_prompt: str, query: str, results: str, chat_history: str) -> str:
        try:
            logger.info("Formatting assistant response using query results and chat history")
            response = await self.chain.ainvoke({
                "user_prompt": user_prompt,
                "query": query,
                "results": results,
                "chat_history": chat_history
            })
            return response.content.strip()
        except Exception as e:
            logger.error(f"Error in FormatterAgent: {e}")
            return f"I processed your query, but ran into an error formatting the result details: {str(e)}"
