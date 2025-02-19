# Prompt Partner

A web application for managing and combining AI prompts. Create, edit, and combine prompts with tags to build powerful master prompts for your AI interactions.

## Features

- Create and edit prompts with tags
- Drag and drop to reorder prompts
- Combine multiple prompts into a master prompt
- Copy combined prompts to clipboard
- Tag-based organization
- Real-time preview

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prompt-partner.git
cd prompt-partner
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create `.env` files:

Backend (.env):
```
PORT=5001
NODE_ENV=development
DB_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3001
```

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:5001
```

4. Start the application:
```bash
# On Windows
start.bat

# On Unix/Linux/Mac
./start.sh
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001

## API Endpoints

- `GET /prompts` - Retrieve all prompts
- `POST /prompts` - Create a new prompt
  - Required fields: `name`, `content`
  - Optional field: `tags`
- `PUT /prompts/:id` - Update an existing prompt
- `DELETE /prompts/:id` - Delete a prompt

## Tech Stack

### Frontend
- React
- Chakra UI
- @dnd-kit (for drag and drop)
- Emotion (for styling)

### Backend
- Express.js
- SQLite3
- CORS
- Nodemon (development)

## Development

The project uses the following ports by default:
- Frontend: 3001
- Backend: 5001

To modify these ports:
1. Update the `PORT` in backend/.env
2. Update the `FRONTEND_URL` in backend/.env
3. Update the `REACT_APP_API_URL` in frontend/.env

## Testing

### Running Tests

Frontend tests:
```bash
cd frontend

# Run tests in watch mode
npm test
```

Backend tests:
```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Manual Testing
For manual testing of the application:
1. Start both frontend and backend servers
2. Test basic CRUD operations for prompts
3. Verify prompt selection and combination
4. Test drag-and-drop reordering
5. Verify clipboard operations

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
