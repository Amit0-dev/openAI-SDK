import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const GetWeatherResultSchema = z.object({
    cities: z.array(
        z.object({
            city: z.string().describe("Name of the city"),
            degree_c: z.number().describe("The degree celcius of the temp"),
            condition: z.string().optional().describe("Condition of the weather"),
        })
    ),
});

// Tool for agent
const getWeatherTool = tool({
    name: "get_weather",
    description: "Return the current weather information for the given city",
    parameters: z.object({
        city: z.string().describe("name of the city"),
    }),
    execute: async function ({ city }) {
        // console.log(`⚙️ Calling Get Weather for ${city}`)
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;

        const response = await axios.get(url, { responseType: "text" });

        return `The weather of ${city} is ${response.data}`;
    },
});

// My Agent
const agent = new Agent({
    name: "Weather Agent",
    instructions: `You are an expert weather agent that helps user to tell weather report of the cities.`,
    tools: [getWeatherTool],
    outputType: GetWeatherResultSchema,
});

// Main function
async function main(query = "") {
    const result = await run(agent, query);
    console.log(`Result: `, result.finalOutput);
}

main("What is the weather of Goa, Delhi and Kolkata? Give output for all three of them.");
