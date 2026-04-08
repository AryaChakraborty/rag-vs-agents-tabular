"""Generate a fake customers.csv with 10,000 rows for the demo."""
import os
import random
from pathlib import Path

import pandas as pd
from faker import Faker

CITY_COUNTRY = {
    "Mumbai": "India",
    "Delhi": "India",
    "Bangalore": "India",
    "London": "United Kingdom",
    "New York": "United States",
    "Tokyo": "Japan",
    "Dubai": "United Arab Emirates",
    "Singapore": "Singapore",
    "Sydney": "Australia",
    "Berlin": "Germany",
    "Paris": "France",
    "Toronto": "Canada",
    "San Francisco": "United States",
    "Lagos": "Nigeria",
    "Sao Paulo": "Brazil",
    "Seoul": "South Korea",
    "Bangkok": "Thailand",
    "Cape Town": "South Africa",
    "Amsterdam": "Netherlands",
    "Jakarta": "Indonesia",
}

N_ROWS = 10_000


def main() -> None:
    fake = Faker()
    Faker.seed(42)
    random.seed(42)

    cities = list(CITY_COUNTRY.keys())
    rows = []
    for i in range(1, N_ROWS + 1):
        city = random.choice(cities)
        first = fake.first_name()
        last = fake.last_name()
        rows.append(
            {
                "id": i,
                "first_name": first,
                "last_name": last,
                "email": f"{first.lower()}.{last.lower()}{i}@example.com",
                "age": random.randint(18, 75),
                "city": city,
                "country": CITY_COUNTRY[city],
                "signup_date": fake.date_between(
                    start_date="-4y", end_date="today"
                ).isoformat(),
                "total_purchases": random.randint(0, 60),
                "purchase_amount": round(random.uniform(10, 5000), 2),
            }
        )

    df = pd.DataFrame(rows)
    out = Path(__file__).parent / "data" / "customers.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    print(f"Wrote {len(df):,} rows to {out}")


if __name__ == "__main__":
    main()
