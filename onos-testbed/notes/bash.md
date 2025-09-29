# Bash
- most popular shell
- **Shell:** text-based interface that lets you talk to your computer (any command-line tool)
- Bash is used to run commands and write scripts on Unix/Linux system.

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
### `wget`
### `ssh`
### `scp`
### `rsync`

## File Compression
### `zip`
### `unzip`
### `tar`

## File Permissions
### `chmod`
### `chown`
### `chgrp`

## Scripting
### Bash Syntax
### Bash Script
### Bash Variables
### Bash Data Types
### Bash Operators
### Bash If...Else
### Bash Loops
### Bash Functions
### Bash Arrays
### Bash Schedule
