# Print AI Assessment

## Setup instructions

**Command**: `docker-compose up`

## Example queries

### Example 1

**Question**: "Find me a mystery book under £10"

**Answer**: "It looks like I couldn't find any mystery books priced under £10. The lowest priced book in the mystery category is "Tastes Like Fear (DI Marnie Rome #3)" at £10.69. Would you like to consider that book or look in another category?"

### Example 2

**Question**: "Find me a book about science under £15"

**Answer**: "Here are some science books available under £15:

1. The Elegant Universe: Superstrings, Hidden Dimensions, and the Quest for the Ultimate Theory - Price: £13.03 - ![Image](
🔗

2. The Origin of Species - Price: £10.01 - ![Image](
🔗

Would you like more information about any of these books?"

### Example 3

**Question**: "Show me trending tech headlines"

**Answer**: "Here are some trending tech headlines:

1. [Show HN: I made a Doom-like game fit inside a QR code](
🔗

- Score: 47 2. [A New ASN.1 API for Python](
🔗
- Score: 87 3. [Show HN: Attune - Build and publish APT repositories in seconds](
🔗
- Score: 21 4. [Less Slow C++](
🔗
- Score: 119 5. [How a yacht works: sailboat physics and design](
🔗
- Score: 48
If you want more details about any specific headline or more articles, feel free to ask!"

## Redis schema

**Key pattern**: `book:<id>` or `book:<category>`

**Description**: Stores detailed information about a book, uniquely identified by its ID.

**Value Type**: JSON

**Value Structure**:

- `id`: Integer (Unique book identifier)
- `title`: String (Title of the book)
- `category`: String (Category of the book)
- `price`: Float (Price of the book)
- `image_url`: String (Image url of the book)

## n8n Webhook

**Endpoint**: `https://yoshi-team.app.n8n.cloud/webhook/ask`
