import json
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from app.prompts.role_prompt import ROLE_PROMPT_TEMPLATE
from app.utils.config import settings
from app.utils.logger import logger

class RoleAgent:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            temperature=0.0
        )
        self.prompt = PromptTemplate(
            input_variables=["user_role", "user_prompt"],
            template=ROLE_PROMPT_TEMPLATE
        )
        self.chain = self.prompt | self.llm

    async def authorize(self, user_role: str, user_prompt: str) -> dict:
        try:
            logger.info(f"Checking authorization for role '{user_role}' with prompt: '{user_prompt}'")
            response = await self.chain.ainvoke({
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
            return {
                "is_authorized": bool(data.get("is_authorized", True)),
                "reason": data.get("reason", "")
            }
        except Exception as e:
            logger.error(f"Error in RoleAgent: {e}")
            # Fallback check: admins are always authorized, customers get restricted on keywords like delete/create
            is_authorized = (user_role == "admin")
            if not is_authorized:
                # Basic safety fallback check on keywords if LLM parsing errors out
                lower_prompt = user_prompt.lower()
                forbidden = ["delete", "drop", "remove", "update user", "make admin", "grant admin"]
                is_authorized = not any(word in lower_prompt for word in forbidden)
            
            return {
                "is_authorized": is_authorized,
                "reason": f"Fallback check due to error: {str(e)}"
            }
