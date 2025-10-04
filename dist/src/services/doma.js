// src/services/doma.ts
import axios from 'axios';
import 'dotenv/config';
const SUBGRAPH_ENDPOINT = "https://api-testnet.doma.xyz/graphql";
// FINAL & CORRECTED QUERY: This query is designed based on our successful experiments.
// It fetches Name-level activities and, crucially, Token-level activities (like transfers)
// from the correct nested location. It uses no invalid arguments.
const GET_DOMAIN_DEEP_DIVE_QUERY = `
  query GetDomainDeepDive($name: String!) {
    name(name: $name) {
      # Core Name Attributes
      name
      expiresAt
      tokenizedAt
      transferLock
      claimedBy
      
      # Registrar Information
      registrar {
        name
        ianaId
      }
      
      # Name-level activities (Renewals, Claims)
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

      # Token Information (Ownership and nested activities)
      tokens {
        tokenId
        networkId
        ownerAddress
        type
        
        # CRITICAL: Token-level activities (Transfers, Listings, Sales)
        # This is where the most valuable liquidity signals are.
        activities {
          __typename
          ... on TokenTransferredActivity {
            createdAt
            transferredFrom
            transferredTo
          }
          ... on TokenPurchasedActivity {
            createdAt
            seller
            buyer
            payment {
              price
              currencySymbol
            }
          }
        }
      }
    }
  }
`;
/**
 * Fetches a comprehensive on-chain profile for a given domain from the Doma Subgraph.
 *
 * @param domain The domain name to query (e.g., "crypto.ai").
 * @returns A promise that resolves to the raw data object for the domain, or null if not found or an error occurs.
 */
export async function getDomaOnChainData(domain) {
    console.log(`Initiating Doma Subgraph query for ${domain}...`);
    if (!process.env.DOMA_API_KEY) {
        throw new Error("DOMA_API_KEY is not defined in your .env file.");
    }
    try {
        const response = await axios.post(SUBGRAPH_ENDPOINT, {
            query: GET_DOMAIN_DEEP_DIVE_QUERY,
            variables: { name: domain },
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': process.env.DOMA_API_KEY,
            },
        });
        if (response.data.errors) {
            console.error(`Doma Subgraph returned GraphQL errors for ${domain}:`, JSON.stringify(response.data.errors, null, 2));
            return null;
        }
        const nameData = response.data.data?.name;
        if (!nameData) {
            console.log(`No on-chain data found for domain in Doma Subgraph: ${domain}`);
            return null;
        }
        console.log(`Successfully fetched on-chain data for ${domain}.`);
        return nameData;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Axios error fetching Doma data for ${domain}: ${error.message}`);
            console.error("Response Data:", error.response?.data);
        }
        else {
            console.error(`An unexpected error occurred while fetching Doma data for ${domain}:`, error);
        }
        return null;
    }
}
