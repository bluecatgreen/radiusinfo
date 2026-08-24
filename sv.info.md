rjankir@debian:~/svelte/radiusinfo$ npx sv create 

HINT: Run "sv --help" to get the full list of commands, add-ons, and examples to one-shot and skip interactive prompts.
┌  Welcome to the Svelte CLI! (v0.17.0)
│
◇  Where would you like your project to be created?
│  ./
│
◇  Directory not empty. Continue?
│  Yes
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
│
◇  What would you like to add to your project? (use arrow keys / space
│   bar)
│  prettier, eslint, vitest, tailwindcss, sveltekit-adapter, drizzle, 
│  better-auth, ai-tools
│
◇  vitest: What do you want to use vitest for?
│  unit testing, component testing
│
◇  tailwindcss: Which plugins would you like to add?
│  typography, forms
│
◇  sveltekit-adapter: Which SvelteKit adapter would you like to use?
│  vercel
│
◇  drizzle: Which database would you like to use?
│  PostgreSQL
│
◇  drizzle: Which PostgreSQL client would you like to use?
│  Postgres.JS
│
◇  drizzle: Do you want to run the database locally with 
│  docker-compose?
│  Yes
│
◇  better-auth: Which demo would you like to include?
│  Email & Password
│
◇  ai-tools: Which client would you like to use?
│  Claude Code
│
◇  ai-tools: How would you like to add the Svelte tools?
│  Svelte plugin
│
◆  Project created
│
◇  Which package manager do you want to install dependencies with?
│  npm
│
◆  Successfully setup add-ons: prettier, eslint, vitest, tailwindcss, sveltekit-adapter, ai-tools, drizzle, better-auth
│
│  To skip prompts next time, run:
●  npx sv@0.17.0 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:vercel" drizzle="database:postgresql+postgresql:postgres.js+docker:yes" better-auth="demo:password" ai-tools="ide:claude-code+delivery:plugin" --install npm ./
│
◆  Successfully installed dependencies with npm
│
◇  Successfully formatted modified files
│
◇  What's next? ───────────────────────────────────────────────────────────────╮
│                                                                              │
│  📁 Project steps                                                            │
│                                                                              │
│    1: npm run dev -- --open                                                  │
│                                                                              │
│  To close the dev server, hit Ctrl-C                                         │
│                                                                              │
│  🧩 Add-on steps                                                             │
│                                                                              │
│    ai-tools:                                                                 │
│      - Open the project in Claude Code and trust the workspace - the Svelte  │
│   plugin installs automatically.                                             │
│    drizzle:                                                                  │
│      - Run npm run db:start to start the docker container                    │
│      - Run npm run db:push to update your database schema                    │
│    better-auth:                                                              │
│      - Run npm run auth:schema to generate the auth schema                   │
│      - Run npm run db:push to update your database                           │
│      - Check ORIGIN & BETTER_AUTH_SECRET in .env and adjust it to your       │
│  needs                                                                       │
│      - Visit /demo/better-auth route to view the demo                        │
│                                                                              │
│  Stuck? Visit us at https://svelte.dev/chat                                  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────╯
│
└  You're all set!

