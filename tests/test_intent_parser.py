import asyncio
import json
from app.services.llm_service import parse_user_intent

async def main():
    test_query = "I need a cheap, high-protein vegan lunch that isn't salad."
    print(f"Testing Query: {test_query}")

    intent = await parse_user_intent(test_query)

    print("\nParsed Intent JSON:")
    print(intent.model_dump_json(indent=2))

if __name__ == "__main__":
    asyncio.run(main())
