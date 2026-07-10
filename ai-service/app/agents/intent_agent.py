import json
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from app.prompts.intent_prompt import INTENT_PROMPT_TEMPLATE
from app.utils.config import settings
from app.utils.logger import logger

class IntentAgent:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=0.0
        )
        self.prompt = PromptTemplate(
            input_variables=["user_prompt"],
            template=INTENT_PROMPT_TEMPLATE
        )
        self.chain = self.prompt | self.llm

    async def validate(self, user_prompt: str) -> dict:
        try:
            logger.info(f"Validating user prompt: '{user_prompt}'")
            response = await self.chain.ainvoke({"user_prompt": user_prompt})
            text = response.content.strip()
            
            # Clean JSON markers if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            data = json.loads(text)
            return {
                "is_related": bool(data.get("is_related", True)),
                "reason": data.get("reason", "")
            }
        except Exception as e:
            logger.error(f"Error in IntentAgent: {e}")
            # Fallback to True to allow the query to proceed, logging the error
            return {"is_related": True, "reason": f"Fallback due to error: {str(e)}"}
