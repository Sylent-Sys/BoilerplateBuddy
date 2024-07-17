import type { Repos } from './interface/Repo.js';
import inquirer from 'inquirer';
import { simpleGit } from 'simple-git';
import path from 'path';
import { rmSync } from 'fs';
import chalk from 'chalk';
import { Branches } from './interface/Branch.js';

const git = simpleGit();

async function init() {
    const boilerplates: Repos = await ((await fetch('https://api.github.com/users/sylent-sys/repos')).json())
    try {
        const { boilerplate }: {
            boilerplate: string;
        } = await inquirer.prompt([
            {
                type: 'list',
                name: 'boilerplate',
                message: 'Select a boilerplate to initialize:',
                choices: boilerplates.filter((value) => {
                    return value.name.startsWith('boilerplate-');
                }).map(bp => bp.name),
            },
        ]);
        const branches: Branches = await ((await fetch(`https://api.github.com/repos/Sylent-Sys/${boilerplate}/branches`)).json())
        const { branch }: {
            branch: string;
        } = await inquirer.prompt([
            {
                type: 'list',
                name: 'branch',
                message: 'Select a branch to initialize:',
                choices: branches.map(bp => bp.name),
            },
        ]);
        const { projectName, projectDir }: {
            projectName: string;
            projectDir: string;
        } = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'Enter the project name:',
            },
            {
                type: 'input',
                name: 'projectDir',
                message: 'Enter the directory to create the project:',
                default: process.cwd(),
            },
        ]);
        const selectedBoilerplate = boilerplates.find(bp => bp.name === boilerplate);
        if (!selectedBoilerplate) throw new Error('Boilerplate not found');
        const targetPath = path.join(projectDir, projectName);
        console.log(chalk.blue(`Initializing project in ${targetPath} from ${selectedBoilerplate.clone_url} on branch ${branch}`));
        await git.clone(selectedBoilerplate.clone_url, targetPath, {
            '--branch': branch,
        });
        rmSync(path.join(targetPath, '.git'), { recursive: true });
        console.log(chalk.green('Project initialized successfully!'));
    } catch (error) {
        console.error('Error initializing project:', error);
    }
}

init();
