// src/services/doma.ts
import axios from 'axios';
import 'dotenv/config';
const SUBGRAPH_ENDPOINT = "https://api-testnet.doma.xyz/graphql";
// This is our comprehensive GraphQL query. It's designed to fetch everything
// the On-Chain Analyst agent will ever need in a single API call for efficiency.
const GET_DOMAIN_DEEP_DIVE_QUERY = `
  query GetDomainDeepDive($name: String!) {
    name(name: $name) {
      name
      expiresAt
      tokenizedAt
      transferLock
      claimedBy
      registrar {
        name
        ianaId
      }
      tokens {
        tokenId
        networkId
        ownerAddress
        type
        activities {
          __typename
          ... on TokenTransferredActivity {
            createdAt
            transferredTo
            transferredFrom
          }
        }
      }
      activities {
        __typename
        ... on NameRenewedActivity {
          createdAt
          expiresAt
        }
        ... on NameClaimedActivity {
          createdAt
        }
      }
    }
  }
`;
/**
 * Fetches a comprehensive on-chain profile for a given domain from the Doma Subgraph.
 *
 * @param domain The domain name to query (e.g., "crypto.ai").
 * @returns A promise that resolves to the processed on-chain data object, or null if not found or an error occurs.
 */
export async function getDomaOnChainData(domain) {
    console.log(`Initiating Doma Subgraph query for ${domain}...`);
    try {
        const response = await axios.post(SUBGRAPH_ENDPOINT, {
            query: GET_DOMAIN_DEEP_DIVE_QUERY,
            variables: { name: domain },
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': process.env.DOMA_API_KEY, // Loaded from your .env file
            },
        });
        if (response.data.errors) {
            console.error("Doma Subgraph GraphQL Errors:", response.data.errors);
            // We return null to indicate the data could not be fetched as expected.
            return null;
        }
        const nameData = response.data.data.name;
        if (!nameData) {
            console.log(`No on-chain data found for domain: ${domain}`);
            return null;
        }
        console.log(`Successfully fetched on-chain data for ${domain}.`);
        return nameData;
    }
    catch (error) {
        // This will catch network errors or other issues with the axios request itself.
        console.error(`Network error fetching Doma data for ${domain}:`, error);
        return null;
    }
}
/**
 * This file now provides a clean, dedicated interface for fetching all the necessary
 * on-chain data for any given domain. Our agents will use this service
 * instead of making raw API calls themselves.
 *
 * When you are ready, say "next" to finally build our first agent: the On-Chain Analyst.
 */ 
//# sourceMappingURL=doma.js.map