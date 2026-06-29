import json
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from app.prompts.query_prompt import QUERY_PROMPT_TEMPLATE
from app.utils.config import settings
from app.utils.logger import logger

class QueryAgent:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=0.0
        )
        self.prompt = PromptTemplate(
            input_variables=["user_id", "user_role", "user_prompt"],
            template=QUERY_PROMPT_TEMPLATE
        )
        self.chain = self.prompt | self.llm

    async def generate(self, user_id: str, user_role: str, user_prompt: str) -> dict:
        try:
            logger.info(f"Generating MongoDB query for user {user_id} ({user_role})")
            response = await self.chain.ainvoke({
                "user_id": user_id,
                "user_role": user_role,
                "user_prompt": user_prompt
            })
            text = response.content.strip()
            
            # Clean JSON markers if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            data = json.loads(text)
            return data
        except Exception as e:
            logger.error(f"Error in QueryAgent: {e}")
            return {
                "collection": None,
                "operation": "none",
                "message": f"Query generation fallback due to error: {str(e)}"
            }
