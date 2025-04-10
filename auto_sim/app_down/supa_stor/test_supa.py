
# Import the necessary libraries
from supabase import create_client, Client

# Define the URL and Key for your Supabase project
url: str = "https://asrsguvvbdjvstkftfpx.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcnNndXZ2YmRqdnN0a2Z0ZnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MDYyODQsImV4cCI6MjA0OTA4MjI4NH0.MdZUhq2MAT1os_F2Zb3-UCqmGD8NZ_vjisUPq-fI8eQ"
# Create a Supabase client
supabase: Client = create_client(url, key)

# Define the table name and the new column details
table_name: str = "3day_forecast"
column_name: str = "temperature"

# Generate random float values between a specified range
def generate_random_temperature():
    return round(random.uniform(-20.0, 40.0), 2)

# Function to add random float values to the temperature column
def add_random_temperatures():
    # Fetch all rows in the table
    rows = supabase.table(table_name).select("*").execute()

    # Iterate through each row and update the temperature column with a random value
    for row in rows.data:
        random_temperature = generate_random_temperature()
        row_id = row["id"]
        update_data = {column_name: random_temperature}
        
        # Update the row with the random temperature value
        supabase.table(table_name).update(update_data).eq("id", row_id).execute()
        print(f"Updated row ID {row_id} with temperature {random_temperature}")

# Call the function to add random temperatures
add_random_temperatures()