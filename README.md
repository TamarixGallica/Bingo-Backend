# Bingo-Backend

This is a soon to be (mostly) RESTful API for a game of Bingo. This project has two goals: Provide an API which could be used by an application for generating Bingo cards based on the parameters given by the user and learn Node, Express and TypeScript in the process.

## Planned features

- [ ] API should expose an endpoint for getting bingo cards
  - A card consists of a number of rows and columns specified in the request
  - Endpoint should support the following parameters
    - [ ] Number of columns (required)
    - [ ] Number of rows (required)
    - [ ] Any number of theme identifiers (optional)
  - If any theme identifiers aren't defined, squares with any themes or without themes should be returned
  - No duplicate squares should be returned
  - If enough squares aren't available for the requested parameters, 404 Not Found should be returned
  - The order of squares should be randomized
- [ ] API should expose an endpoint for reading, creating, updating and deleting 
  - [X] Bingo squares
    - [X] Read
      - [X] By identifier
      - [X] By search string
    - [X] Create
    - [X] Update
    - [X] Delete
  - [ ] Themes
    - [X] Read
      - [X] By identifier
      - [X] By search string
    - [ ] Create
    - [ ] Update
    - [ ] Delete
- [X] API should expose an endpoint for assigning themes to Bingo squares
  - [X] Add a theme
  - [X] Remove a theme

## Requirements

- Assigning multiple themes to a Bingo square should be possible
- No authentication should be required for reading
- Authentication should be required for creating, updating and deleting
- Unit, integration and/or end-to-end tests should be implemented
- Implementation should use Node, Exress and TypeScript

# Entities

- Square
  - Property: Id
  - Property: Text
  - Links to 0..* Themes
- Theme
  - Property: Id
  - Property: Name

# Configuration

Set environment variable DATABASE_URL to specify the connection string for database. Only PostgreSQL is supported at this time. Using .env file is supported. Example value: `postgres://username:password@localhost:5432/bingo`
