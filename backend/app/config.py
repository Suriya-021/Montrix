import os
from dotenv import load_dotenv

# load_dotenv() reads the .env file and makes its values
# available as environment variables. This keeps secrets
# (like database paths, API keys) OUT of your code.
load_dotenv()

# os.getenv() reads an environment variable.
# The second argument is the default value if the variable isn't found.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spendwise.db")
