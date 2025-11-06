import "dotenv/config";
import { Agent, run } from "@openai/agents";

const location = 'US'

const helloAgent = new Agent({
    name: "Hello Agent",
    instructions: function(){
        if(location == "India"){
            return 'Always say namaste and then You are an agent that always says hello world with users name'
        } else {
            return 'That just talk to the user'
        }
    }
    // model: 'gpt-4o-mini'
});

run(helloAgent, "Hey There, My name is Amit").then((res) => {
    console.log(res.finalOutput);
});
