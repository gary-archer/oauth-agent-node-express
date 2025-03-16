# A Node.js OAuth Agent for SPAs

The OAuth agent is an API that issues cookies for Single Page Applications.\
This implementation is a fork from the [original Curity version](https://github.com/curityio/oauth-agent-node-express).\
The main difference in this fork is that I added API operations to enable expiry simulation testing.

## Commands

Run the OAuth Agent:

```bash
export SECRETS_FOLDER="$HOME/secrets"
mkdir -p "$SECRETS_FOLDER"
./certs/create.sh
```

Then run some automated tests against the OAuth Agent endpoints:

```bash
npm test
```
