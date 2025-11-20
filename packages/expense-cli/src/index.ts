import { Command, Option } from "commander";
import chalk from "chalk";
import ora from "ora";
import { config } from "./config.js";
import { createInterface } from "readline";
import { ExpenseAgent } from "./agent/agent.js";
import { rejects } from "assert";

const program = new Command();

program
  .name("expense-cli")
  .description("Expense management CLI")
  .version("1.0.0");

program
  .command("chat")
  .description("Start an Interactive Chat with Expense management")
  .option("-c, --cleaner", "Clear conversation history before starting")
  .action(async (options) => {
    await startChatSession(options.clear);
  });

program
  .command("ask <question>")
  .description("Ask a question to the expense management agent")
  .action(async (question) => {
    await askQuestion(question);
  });

program
  .command("clear")
  .description("Clear conversation history")
  .action(async () => {
    await clearHistory();
  });

/**
 * Start an Interactive chat session
 */
async function startChatSession(clearHistory: boolean = false) {
  console.log(chalk.blue.bold("Expense management"));

  const spinner = ora("Initializing Agent .....").start();
  const agent = new ExpenseAgent();

  try {
    await agent.initialize();

    const providerInfo =
      config.llmProvider === "ollama"
        ? `Using ollama (${config.ollama.model})`
        : `Using ${config.llmProvider}`;

    if (clearHistory) {
      await agent.clearConversationHistory();
      spinner.succeed(`Agent initialized (fresh session) - ${providerInfo}`);
    } else {
      const messageCount = agent["stateManager"]?.getMessages().length || 0;
      if (messageCount > 0) {
        spinner.succeed(
          `Agent initialized (continued session with ${messageCount} previous messages) - ${providerInfo}`,
        );
      } else {
        spinner.succeed(`Agent initialized (new session) - ${providerInfo}`);
      }
    }
  } catch (error) {
    spinner.fail("Failed to initialize agent");
    console.error(error);
    process.exit(1);
  }

  console.log(
    chalk.gray("Type your message or 'exit' to quit, 'Clear' to reset history"),
  );

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  /**
   * Ask a question to the expense management agent
   */
  const askQuestionLoop = () => {
    rl.question(chalk.green("You:"), async (input) => {
      const trimmedInput = input.trim();

      if (trimmedInput.toLowerCase() === "exit") {
        console.log(chalk.blue("\n Goodbye!"));
        await agent.cleanResources();
        rl.close();
        process.exit(0);
        return;
      }

      if (trimmedInput.toLowerCase() === "clear") {
        await agent.clearConversationHistory();
        console.log(chalk.yellow("Conversation history cleared\n"));
        askQuestionLoop();
        return;
      }

      if (!trimmedInput) {
        askQuestionLoop();
        return;
      }

      console.log(chalk.gray("Thinking....\n"));

      try {
        const response = await agent.chat(trimmedInput);
        console.log(chalk.cyan("Agent:"), response + "\n");
      } catch (error) {
        console.error(
          chalk.red("Error:"),
          error instanceof Error ? error.message : error,
        );
        console.log();
      }
      //Continue the loop
      askQuestionLoop();
    });
  };

  //Contioue the loop
  askQuestionLoop();
}
/**
 * Ask a question to the expense management agent
 */
async function askQuestion(question: string) {
  const spinner = ora("Initializing agent......").start();
  const agent = new ExpenseAgent();

  try {
    await agent.initialize();
    spinner.text = "Processing question (this may take 10-30 secconds)";

    //Add timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Request timed out after 60 secconds")),
        60000,
      );
    });

    const response = (await Promise.race([
      agent.chat(question),
      timeoutPromise,
    ])) as string;

    spinner.succeed("Done");

    if (response && response.trim()) {
      console.log(chalk.cyan("\nAgent:"), response + "\n");
    } else {
      console.log(
        chalk.yellow("\nAgent: No response received. Please try again.\n"),
      );
    }

    await agent.cleanResources();
  } catch (error) {
    spinner.fail(`Failed: ${error}`);
    console.error(
      chalk.red("Error:"),
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

/**
 * Clear conversation history
 */
async function clearHistory() {
  const spinner = ora("Clearning conversation history......").start();
  const agent = new ExpenseAgent();

  try {
    await agent.initialize();
    await agent.clearConversationHistory();
    spinner.succeed("History Cleared");
    await agent.cleanResources();
  } catch (error) {
    spinner.fail(`Failed: ${error}`);
    console.error(
      chalk.red("Error:"),
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

program.parse();
