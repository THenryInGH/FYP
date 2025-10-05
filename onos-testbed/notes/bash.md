# Bash
- most popular shell
- **Shell:** text-based interface that lets you talk to your computer (any command-line tool)
- Bash is used to run commands and write scripts on Unix/Linux system.
- Learnt and refer from [w3school](https://www.w3schools.com/bash/index.php)

## Common Bash Commands
Common commands:
- `ls` - List directory contents
- `cd` - Change the current directory
- `pwd` - Print the current working directory
- `echo` - Display a line of text
- `cat` - Concatenate and display files
- `cp` - Copy files and directories
- `mv` - Move or rename files
- `rm` - Delete files or folders
- `touch` - Create an empty file or update its time
- `mkdir` - Create a new folder

### `ls`
- list the contents of a directory

The `ls` command has a variety of options to customize its output:

- `-l` - Long listing format
- `-a` - Include hidden files
- `-h` - Human-readable sizes
- `-t` - Sort by modification time
- `-r` - Reverse order while sorting
- `-R` - List subdirectories recursively
- `-S` - Sort by file size
- `-1` - List one file per line
- `-d` - List directories themselves, not their contents
- `-F` - Append indicator (one of */=@|) to entries

### `cd`
- change the current working directory in the terminal.

The `cd` command supports several useful options for navigating directories:

- `cd ..`: Move up one directory level
- `cd ~`: Change to the home directory
- `cd -`: Switch to the previous directory
- `cd /`: Change to the root directory

### `pwd`
- shows you the full path of the folder you're currently in.

The `pwd` command supports a few options to customize its output:

- `-L`: Display the logical current working directory
- `-P`: Display the physical current working directory (without symbolic links)

### `echo`
-  show a line of text or a variable's value in the terminal

The `echo` command has several options to customize its output:
- `-n` - Don't add a new line at the end
- `-e` - Allow special characters like \n for new lines
- `-E` - Don't allow special characters (default)

### `cat`
- show the content of files in the terminal

The `cat` command has options to change how it shows text:

- `-n` - Add numbers to each line
- `-b` - Add numbers only to lines with text
- `-s` - Remove extra empty lines
- `-v` - Show non-printing characters (except for tabs and end of line)

### `cp`
- copy files and directories from one location to another

The `cp` command has options to change how it works:

- `-r` - Copy all files and folders inside a directory (`cp` didn't copy directories by default)
- `-i` - Ask before replacing (overwriting) files
- `-u` - Copy only if the source is newer
- `-v` - Verbose mode, show files being copied

### `mv`
- move or rename files and directories.

The `mv` command has several options to customize its behavior:

- `-i` - Ask before replacing files
- `-u` - Move only if the source is newer
- `-v` - Verbose mode, show files being moved

### `rm`
- remove files or directories.

The rm command has options to change how it works:

- `-r` - Delete a folder and everything inside it
- `-i` - Ask before deleting each file
- `-f` - Force delete without asking
- `-v` - Verbose mode, show files being removed

### `touch`
-  change file timestamps or create an empty file if it doesn't exist.

The touch command has options to change how it works:

- `-a` - Update only when the file was last read
- `-m` - Update only when the file was last changed
- `-t` - Set the timestamp to a specific time
- `-c` - Do not create any files

### `mkdir`
- create new directories

The `mkdir` command has several options to customize its behavior:

- `-p` - Create parent directories as needed
- `-v` - Show a message for each created directory
- `-m` - Set file mode (permissions)

### `man`
- display the user manual of any command that can be run on the terminal.

### Alias
- create shortcuts for long or frequently used commands.
- makes it easier to execute complex commands with a simple keyword.
- Example:
    ```bash
    # In this example, ll lists all files in long format.
    alias ll='ls -la'

    # Manage alias
    # 1. View alias
    alias
    # 2. Remove alias
    unalias <alias-name>
    ```

## Text Processing
### `grep`
- search for text patterns within files

The `grep` command has options to change how it works:

- `-i` - Search ignoring case differences (uppercase or lowercase)
- `-r` - Search through all files in a directory and its subdirectories
- `-v` - Find lines that do not match the pattern

### `awk`
- pattern scanning and processing language.
- To print the first column of a file, use `awk -F"," '{print $1}' filename`

The `awk` command has options to change how it works:

- `-F` - Set what separates the data fields
- `-v` - Set a variable to be used in the script
- `-f` - Use a file as the source of the awk program

### `sed`
- a stream editor used to perform basic text transformations on an input stream (a file or input from a pipeline)
- To replace the first occurrence of a pattern in a file, use sed 's/old/new/' filename

The `sed` command has options to change how it works:

- `-i` - Edit files directly without needing to save separately
- `-e` - Add the script to the commands to be executed
- `-n` - Don't automatically print lines
- `-r` - Use extended regular expressions
- `-f` - Add script from a file
- `-l` - Specify line length for l command

### `cut`
- remove sections from each lines of files
- To extract the first field of a file, use `cut -f1 filename`

The `cut` command has options to change how it works:

- `-d` - Choose what separates the fields (delimiter)
- `-f` - Select specific fields to display
- `--complement` - Show all fields except the selected ones

### `sort`
-  sort lines of text files.

The `sort` command has options to change how it works:

- `-r` - Sort in reverse order
- `-n` - Sort numbers correctly
- `-k` - Sort by a specific column
- `-u` - Remove duplicate lines
- `-t` - Specify a delimiter for fields

### `tail`
-  display the last part of files.

The `tail` command has several options to customize its behavior:

- `-n [number]`: Display the last [number] lines of the file.
- `-f`: Follow the file as it grows, useful for monitoring log files.
- `-c [number]`: Display the last [number] bytes of the file.
- `--pid=[pid]`: Terminate after the process with the given PID dies.
- `--retry`: Keep trying to open a file even if it is inaccessible.

### `head`
- display the first part of files

The `head` command has several options used to customize its behavior:

- `-n [number]`: Display the first [number] lines of the file.
- `-c [number]`: Display the first [number] bytes of the file.

## System Monitoring
### `ps`
- report a snapshot of current processes
- monitoring and managing processes on system

The `ps` command output consists of several columns, each representing different aspects of the system's processes:

- **PID**: Process ID, a unique identifier for each process.
- **TTY**: Terminal type associated with the process.
- **TIME**: Total CPU time used by the process.
- **CMD**: The command that started the process.

The `ps` command has options to change how it works:

- `-e` - Show all processes
- `-f` - Show detailed information
- `-u [user]` - Show processes for a specific user
- `-a` - Show all processes with a terminal
- `-x` - Show processes without a terminal

### `top`
- display Linux tasks
- monitoring system performance in real-time
- real-time and dynamic report compared to `ps`

The `top` command output consists of several columns, each representing different aspects of the system's processes:

- **PID**: Process ID, a unique identifier for each process.
- **USER**: The user account that owns the process.
- **PR**: Priority of the process.
- **NI**: Nice value, which affects scheduling priority.
- **VIRT**: Virtual memory size used by the process.
- **RES**: Resident memory size, the non-swapped physical memory the process uses.
- **SHR**: Shared memory size.
- **S**: Process status (e.g., S for sleeping, R for running).
- **%CPU**: CPU usage percentage.
- **%MEM**: Memory usage percentage.
- **TIME+**: Total CPU time the process has used since it started.
- **COMMAND**: The command that started the process.

The top command has options to change how it works:

- `-d` - Set the time between updates
- `-p` - Monitor specific PIDs
- `-u` - Show tasks for a specific user
- `-n` - Set the number of iterations
- `-b` - Batch mode operation

### `df`
- report file system disk space usage.

The `df` command output consists of several columns, each representing different aspects of the file system's disk usage:

- **Filesystem**: The name of the file system.
1K-blocks: Total size of the file system in 1K blocks.
- **Used**: Amount of space used.
- **Available**: Amount of space available for use.
- **Use%**: Percentage of space used.
- **Mounted on**: Directory where the file system is mounted.

The `df` command has options to change how it works:

- `-h` - Show sizes in human-readable format (e.g., KB, MB)
- `-a` - Show all file systems, even empty ones
- `-T` - Show the type of file system
- `-i` - Show inode usage
- `-P` - Use POSIX output format

### `du`
- estimate file space usage in current working dir

The `du` command output consists of two columns:

- **Size**: The amount of disk space used by the file or directory.
- **Path**: The file or directory path.

The `du` command has options to change how it works:

- `-h` - Show sizes in human-readable format (e.g., KB, MB)
- `-s` - Show only the total size for each item
- `-a` - Show sizes for all files, not just directories
- `-c` - Produce a grand total
- `--max-depth=N` - Limit the depth of directory traversal

### `free`
- display the amount of free and used memory in the system.

The `free` command has options to change how it works:

- `-h` - Show memory in human-readable format (e.g., KB, MB, GB)
- `-b` - Show memory in bytes
- `-k` - Show memory in kilobytes (KB)
- `-m` - Show memory in megabytes (MB)
- `-g` - Show memory in gigabytes (GB)
- `-s [interval]` - Continuously display memory usage at specified intervals
- `-t` - Display total memory

### `kill`
- terminate processes in a Unix-like operating system.

The `kill` command has several options to customize its behavior:

- `-9`: Forcefully terminate a process.
- `-l`: List all signal names.
- `-s [signal]`: Specify a signal to send.
- `-p`: Print the process ID.

### **uptime**
-  find out how long the system has been running.

The output of the uptime command shows information like:

- **Current Time**: The time at which the command was run.
- **Uptime Duration**: How long the system has been running since the last reboot.
- **Number of Users**: The number of users currently logged into the system.
- **Load Averages**: The system load averages for the past 1, 5, and 15 minutes.

## Networking
### `ping`
- send ICMP ECHO_REQUEST to network hosts.
- `ping <hostname>`

The `ping` command has options to change how it works:

- `-c` - Send a specific number of ping requests
- `-i` - Wait a specific number of seconds between sending each packet
- `-t` - Set the IP Time to Live (TTL)
- `-q` - Quiet output, only show summary
- `-s` - Specify the number of data bytes to be sent

The output of the `ping` command provides several key pieces of information:

- **Bytes**: The size of the ICMP packet sent
Time: The round-trip time it took for the packet to reach the host and return, measured in milliseconds
- **TTL (Time to Live)**: The remaining lifespan of the packet, which decreases by one for each hop
- **Packet Loss**: The percentage of packets that were lost during transmission
- **Round-Trip Time Statistics**: Includes minimum, average, maximum, and standard deviation of the round-trip times

### `curl`
- transfer data from a server using various protocols like HTTP, HTTPS, FTP and more
- downloading files, testing APIs, and more
- `curl <url>`

The curl command has options to change how it works:

- `-O` - Save the file with the same name as the remote file
- `-L` - Follow redirects
- `-I` - Fetch the HTTP headers only
- `-d` - Send data with POST request
- `-u` - Specify user and password for server authentication

The curl command output will vary depending on which options are used:

- `HTTP Status Code`: Indicates the success or failure of the request.
- `Response Headers`: Provide metadata about the server response.
- `Response Body`: The actual content retrieved from the server.
- `Progress Meter`: Shows download progress and speed.

### `wget`
- download files from the web
- `wget <url>`

The wget command has options to change how it works:

- `-b` - Run in the background
- `-q` - Quiet mode (no output)
- `-r` - Download directories recursively
- `-c` - Continue getting a partially-downloaded file
- `--limit-rate` - Limit download speed

### `ssh`
- connect to remote device securely
- `ssh <user>@<hostname>`

Here are some common options you can use with the `ssh` command:

- `-p` - Specify the port
- `-i` - Use a private key file
- `-v` - Enable verbose mode
- `-C` - Enable compression
- `-X` - Enable X11 forwarding
- `-o` - Specify options directly on the command line

#### Troubleshooting Common Issues
Common issues like "Connection Refused" or "Host Key Verification Failed" can occur. Here are some steps to troubleshoot these problems:

- **Connection Refused**: Ensure the SSH service is running on the remote server and the correct port is being used. Check firewall settings to make sure they are not blocking the connection.
- **Host Key Verification Failed**: This happens when the server's host key changes. Verify the server's identity and update the known_hosts file by removing the old key entry.
- **Permission Denied**: Check permissions and username. Check the server's SSH configuration for restrictions.
- **Timeouts**: Check network connectivity and server responsiveness. Adjust the SSH timeout settings if necessary.


### `scp`
- securely copy files between hosts on a network
- `scp file user@hostname:/path`

The `scp` command supports various options to customize its behavior:

- `-r` - Recursively copy entire directories
- `-P` - Specify the port to connect to on the remote host
- `-i` - Specify an identity (private key) file
- `-C` - Enable compression
- `-v` - Enable verbose mode
- `-l` - Limit the bandwidth used by the copy

### `rsync`
- efficiently transfer and synchronize files across computer systems, by checking the timestamp and size of files
- To synchronize a directory to a remote host, use `rsync -avz source user@hostname:/path`

The output of the `rsync` command can vary depending on the options used. Here are some common elements:

- **File List**: Lists the files being transferred.
- **Transfer Progress**: Shows the progress of each file transfer.
- **Compression Ratio**: Indicates the effectiveness of compression if used.
- **Speed**: The speed at which files are being transferred.

Here are some common options you can use with the `rsync` command:

- `-a` - Archive mode
- `-v` - Increase verbosity
- `-z` - Compress file data
- `--delete` - Delete extraneous files
- `-r` - Recurse into directories
- `-u` - Skip files that are newer on the receiver
- `--progress` - Show progress during transfer

## File Compression
### `zip`
- package and compress files into a ZIP archive.
- To create a ZIP archive, use `zip archive.zip file1 file2`

Here are some common options you can use with the `zi`p` command:

- `-r` - Recursively zip directories
- `-u` - Update files in the archive if they are newer
- `-d` - Delete files from the archive
- `-e` - Encrypt the contents of the ZIP archive
- `-x` - Exclude specific files from being zipped

### `unzip`
- extract compressed files from a ZIP archive.
- `unzip <zip-name>`

Here are some common options you can use with the `unzip` command:

- `-l` - List archive files without extracting them
- `-t` - Test compressed archive files
- `-d` - Extract files into a different directory
- `-o` - Overwrite existing files without prompting
- `-x` - Exclude specific files from being extracted

### `tar`
- create, maintain, modify, and extract files from an archive file.

Here are some common options you can use with the `tar` command:

- `-c` - Create a new archive
- `-x` - Extract files from an archive
- `-t` - List the contents of an archive
- `-z` - Filter the archive through gzip
- `-v` - Verbosely list files processed
- `-f` - Specify the filename of the archive

## File Permissions
- In Unix-like OS, file permissions and ownership are crucial for managing access to files and directories.
- File permissions are represented by a series of characters:
    - `r`: Read permission
    - `w`: Write permission
    - `x`: Execute permission
- E.g. `rwxr-xr--`: owner has rwx permissions, group can r & x, while other users can read only.
- File permissions can also be represented numerically, which is often used in scripts and command-line operations:

    - 0: No permission
    - 1: Execute permission
    - 2: Write permission
    - 3: Write and execute permissions
    - 4: Read permission
    - 5: Read and execute permissions
    - 6: Read and write permissions
    - 7: Read, write, and execute permissions
- E.g. `755`: owner can rwx, group and others can r-x 

- Each file has an owner and a group associated with it.

### `chmod`
- change the file permissions in Unix-like operating systems
- `chmod [options] mode[,mode] file1 [file2 ...]`
- `chmod -v 644 file.txt`
The `chmod` command has several options to customize its behavior:

- `-R`: Change files and directories recursively.
- `-v`: Output a diagnostic for every file processed.

### `chown`
- change the ownership of files and directories
- `chown [options] user[:group] file1 [file2 ...]`
- `chown -R user:group /path/to/directory`

The `chown` command has several options to customize its behavior:

- `-R`: Change files and directories recursively.
- `-v`: Output a diagnostic for every file processed.

### `chgrp`
- change the group ownership of files and directories
- set which group owns a file
- `chgrp [options] group file1 [file2 ...]`
- `chgrp -R group /path/to/directory`

The `chgrp` command has several options to customize its behavior:

- `-R`: Change files and directories recursively.
- `-v`: Output a diagnostic for every file processed.


## Scripting
- the practice of writing a sequence of commands into a text file, which can then be executed by the Bash


### Bash Syntax
- use `#` to write comments
- commands are run in sequence from top to bottom
- use `;` to separate multiple commands on the same line
- Best practices:
    - use comments to explain code
    - choose meaningful variable names
    - test scripts thoroughly before using them in production

### Bash Script
- files containing commands that you run in terminal
- automate tasks and make work more efficient
- start a **bash script** with `#!` followed by the path to Bash, usually `/bin/bash` to let script has execute permissions.

### Bash Variables
- Variables store data that script can use
- To **assign** the value of variable, use the `=` without space
- E.g. `name="World"`
- To **access** the value of variable, prefix it with a `$`
- E.g. `echo "Hello, $name!"`
#### Environment Variables
- special variables that affect the way processes run on system
- used to store system-wide values like the location of executables or the default editor.
#### Local vs. Global Variables
- Local only available within the block of code in which they are defined
- Global are accessible from anywhere in the script
- Example:
    ```bash
    # Define a local variable in a function
    my_function() {
        local_variable="I am local"
        echo $local_variable
    }
    myfunction
    ```
#### Common Variable Operations
- **Concatenation**: Combine strings using variables.
- **Arithmetic**: Perform calculations using variables.
- **Example**:
    ```bash
    # concatenation
    greeting="Hello, "
    name="World"
    echo "$greeting$name"

    # arithmetic
    num1=5
    num2=6
    sum=$((num1 + num2))
    echo "The sum is $sum"
    ```

### Bash Data Types
1. String
    - store text of sequence of characters
    - can perform string operation such as concatenation and substring extraction.
2. Numbers
    - support integer arithmetic natively such as addition, subtraction, multiplication, and division
    - special expansion used `$((...))`
    ```bash
    # Example
    num1=5
    num2=10
    sum=$((num1 + num2))
    difference=$((num2 - num1))
    product=$((num1 * num2))
    quotient=$((num2 / num1))
    echo "Sum: $sum, Difference: $difference, Product: $product, Quotient: $quotient"
    ```
3. Arrays
    - Store multiple values in single variable
    ```bash
    # Array example
    fruits=("apple" "banana" "cherry")
    for fruit in "${fruits[@]}"; do
        echo $fruit
    done
    ```
4. Associative Arrays
    - used named keys to access values in array
    ```bash
    # Associative array example
    declare -A colors
    colors[apple]="red"
    colors[banana]="yellow"
    colors[grape]="purple"
    unset colors[banana]
    echo ${colors[apple]} # red
    echo ${colors[grape]} # purple
    ```

Bash does not support floating-point arithmetic natively, use external tools like `bc` or `awk` to perform such operations.

### Bash Operators
#### Comparison Operators
- `-eq`: Equal to
- `-ne`: Not equal to
- `-lt`: Less than
- `-le`: Less than or equal to
- `-gt`: Greater than
- `-ge`: Greater than or equal to

#### String Comparison Operators
- `=`: Equal to
- `!=`: Not equal to
- `<`: Less than, in ASCII alphabetical order
- `>`: Greater than, in ASCII alphabetical order

#### Arithmetic Operators
- `+`: Addition
- `-`: Subtraction
- `*`: Multiplication
- `/`: Division
- `%`: Modulus (remainder of division)
- For exponentiation, use external tools like bc or awk.

#### Logical Operators
- `&&`: Logical AND
- `||`: Logical OR
- `!`: Logical NOT

#### File Test Operators
- `-e`: Checks if a file exists
- `-d`: Checks if a directory exists
- `-f`: Checks if a file is a regular file
- `-s`: Checks if a file is not empty

### Bash If...Else
- determine tasks to do based on conditions
- Condition enclosed in a []
- use `fi` to close `if`
- `else` for alternative instead of `if` and `elif`
- `elif` to allow multiple conditions
Example:
```bash
# If...elif...else statement
num=10
if [ $num -gt 10 ]; then
  echo "Number is greater than 10"
elif [ $num -eq 10 ]; then
  echo "Number is exactly 10"
else
  echo "Number is less than 10"
fi

# Nested if statement
num=5
if [ $num -gt 0 ]; then
  if [ $num -lt 10 ]; then
    echo "Number is between 1 and 9"
  fi
fi
```

### Bash Loops
- `done` is used to enclosed every loop
#### For loop
- do repeating tasks for a specific times
```bash
# For loop example
for i in {1..5}; do
  echo "Iteration $i"
done
```
#### While loop
- repeat tasks as long as condition meet
```bash
# While loop example
count=1
while [ $count -le 5 ]; do
  echo "Count is $count"
  ((count++))
done
```
#### Until loop
- similar to while, but execute until a certain condition is meet
```bash
# Until loop example
count=1
until [ $count -gt 5 ]; do
  echo "Count is $count"
  ((count++))
done
```
#### Break and Continue
- used to control loop execution
- `break` to exit loop, `continue` to skips the next iteration
- typically used inside conditional block
```bash
# Break and continue example
for i in {1..5}; do
  if [ $i -eq 3 ]; then
    continue
  fi
  echo "Number $i"
  if [ $i -eq 4 ]; then
    break
  fi
done
```
#### Nested Loops
- loop in loop
```bash
# Nested loops example
for i in {1..3}; do
  for j in {1..2}; do
    echo "Outer loop $i, Inner loop $j"
  done
done
```
### Bash Functions
1. Defining Function
```bash
# Example
my_function() {
  echo "Hello, World!"
}
```
2. Calling Function
```bash
#Example
my_function

```
3. Advanced Function Features
    - accept arguments
    - return values using `echo` or `return`
    - use local variables
```bash
# Example
add() {
  local sum=$(($1 + $2))
  echo $sum
}
result=$(add 5 3)
echo "The sum is $result"
```

### Bash Arrays
- index start with `0`
```bash
# create an array
my_array=("value1" "value2" "value3")

# modify an array
my_array[1]="new_value"

# access an array
echo ${my_array[0]}

```
### Bash Schedule
`cron`
- time-based job scheduler in Unix-like OS
- background service 
- use command `crontab [options]`

Options
- `-e`: Edit the crontab file for the current user.
- `-l`: List the crontab entries for the current user.
- `-r`: Remove the crontab file for the current user.

Setting up:
Format = `* * * * * command_to_execute`
- Minute: 0-59
- Hour: 0-23
- Day of Month: 1-31
- Month: 1-12
- Day of Week: 0-7 (0 and 7 are Sunday)

Example 
```bash
# start edit
crontab -e
# select editor
0 0 * * * /path/to/script.sh
```
Cron jobs are commonly used to:

- Automate system maintenance tasks, like backups and updates.
- Schedule scripts to run at specific times or intervals.
- Perform regular monitoring and reporting tasks.

### C-style code in Bash
While Bash is a shell scripting language and not C, it offers certain constructs that mimic C-style syntax, particularly for arithmetic operations and loops.
1. C-style for loop:
Bash provides a specific syntax for C-style for loops within double parentheses ((...)).

```bash 
for ((initializer; condition; increment)); do
    # commands within the loop
done
```
Example:
```bash

for ((i = 0; i < 5; i++)); do
    echo "Current value of i: $i"
done
```

2. Arithmetic Expansion and C-style Operators:
The ((...)) construct also allows for C-style arithmetic expressions and operators.
```bash
((expression))
```
Example:
```bash
x=10
y=5
((result = x + y))
echo "Result of addition: $result"

((x++)) # Increment x
echo "Incremented x: $x"

if ((x > y)); then
    echo "x is greater than y"
fi
```

3. Ternary Operator:
Bash supports the C-style ternary operator within arithmetic expansion.
```bash
((variable = condition ? value_if_true : value_if_false))
```
Example:
```bash
age=20
((status = age >= 18 ? 1 : 0))
echo "Status (1 for adult, 0 for minor): $status"
```

Limitations:
- No Data Types: Bash variables are untyped, unlike C. All values are treated as strings until an arithmetic context forces them to be interpreted as numbers.
- No Pointers or Memory Management: Bash does not offer direct memory manipulation or pointers like C.
Limited Functionality: While some syntax resembles C, Bash is fundamentally a shell language focused on command execution and process management, not general-purpose programming like C.
- These C-style constructs in Bash provide a familiar syntax for users accustomed to C, particularly for numerical operations and loop control within scripts.