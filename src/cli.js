#!/usr/bin/env node

import fs from 'fs';
import chalk from 'chalk';

export function cli(args) {
  try {
    // Parse arguments
    const operation = parseArguments(args);
    
    // Load from store
    const store = JSON.parse(fs.readFileSync(new URL('./store.json', import.meta.url), 'utf-8'));

    // Perform billing
    if (operation.type === 'bill') {
      const currentUser = store.find(item => item.id === Number(operation.userId));
      
      // Check if user exists
      if (!currentUser) {
        throw new Error(`No user with id ${operation.userId}`);
      }
      
      // Check if user can be billed
      if (currentUser.canWithdraw && currentUser.balance >= Number(operation.amount)) {
        // Update user balance
        currentUser.balance -= operation.amount;
        currentUser.canWithdraw = currentUser.balance > 0;
        
        // Update store with new user data to reflect the current amount
        fs.writeFile(new URL('./store.json', import.meta.url), JSON.stringify(store, null, 2), function(err) {
          if (err) {
            throw new Error(err.message);
          }
          console.log(chalk.greenBright(`Successfully billed ${currentUser.name} ${operation.amount}`));
        });
      } else {
        throw new Error(`Unable to bill ${currentUser.name}`);
      }
    }
  } catch (error) {
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

function parseArguments(args) {
  args.splice(0, 2);

  if (args.length === 0) {
    throw new Error('No arguments provided. Please specify an operation and the necessary parameters.');
  }

  const operation = {
    type: args[0]
  };

  args.forEach((arg, index) => {
    if (arg.includes('--id') || arg.includes('id')) {
      const userId = Number(args[index + 1]);
      if (Number.isNaN(userId)) {
        throw new Error('Item after `id` must be a number');
      }
      operation.userId = userId;
    }
    if (arg.includes('--amount') || arg.includes('amount')) {
      const amount = Number(args[index + 1]);
      if (Number.isNaN(amount)) {
        throw new Error('Item after `amount` must be a number');
      }
      operation.amount = amount;
    }
  });

  if (!(operation.hasOwnProperty('userId') && operation.hasOwnProperty('amount'))) {
    throw new Error('Must specify userId and amount via --id `id` and --amount `amount`');
  }
  
  return operation;
}

// Uncomment if you want to test it directly via node
// cli(process.argv);
