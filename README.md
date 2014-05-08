# forkchildcell organelle

Forks a cell wrapped as child process using provided dna

## dna

    "forkcell": {
      "source": "plasma/forkchildcell",
      "dna": {
        "cronactivity": {
          "source": "plasma/cronactivity",
          "cwd": {
            "main": "/path/relative/to/cwd/activity"
          },
          "cronTime": "42 * * * * *",
          "flushUsersDoneMessage": "Example run every 42 seconds"
        }
      },
      "log": false
    }

## reacts to chemical `kill`
Stops child process

## reacts to chemical value of `dna.reactOn`
Starts child cell using given chemical