## Summary - v1.3.0

Date : 2021-02-26 21:42:21

Total : 42 files,  4287 codes, 526 comments, 1219 blanks, all 6032 lines

### Languages
| language | files | code | comment | blank | total |
| :--- | ---: | ---: | ---: | ---: | ---: |
| JavaScript | 21 | 2,763 | 505 | 937 | 4,205 |
| HTML | 16 | 1,366 | 20 | 254 | 1,640 |
| Markdown | 2 | 67 | 0 | 25 | 92 |
| JSON | 2 | 57 | 0 | 1 | 58 |
| XML | 1 | 34 | 1 | 2 | 37 |

### Directories
| path | files | code | comment | blank | total |
| :--- | ---: | ---: | ---: | ---: | ---: |
| . | 42 | 4,287 | 526 | 1,219 | 6,032 |
| helperData | 1 | 175 | 0 | 52 | 227 |
| src | 38 | 4,044 | 526 | 1,141 | 5,711 |
| src/assets | 11 | 260 | 3 | 10 | 273 |
| src/classes | 1 | 54 | 10 | 11 | 75 |
| src/gdsAddOn | 4 | 787 | 100 | 278 | 1,165 |
| src/sheetsAddOn | 14 | 1,924 | 249 | 642 | 2,815 |


### Change Log notes
- v 1.4.0
Breaking changes
- Updated the list tab to now only include the ID and Person ID. If additional data from the list is needed it'll need to be linked in GDS

Improvements
- Updated the API calls to now sync on average 40% faster
- Fixed the PCO List People call to now only require the lists in which have been selected
- Updated the people call to also loop over the list array for people. This adds time to the sync but is more future proof.

### Current Stats

Syncing personDataCall
- Pre-improvement = 42 seconds.
- without the await between syncs - syncing: 50011ms - 50 seconds

18 second waits, 80 second chunks
- syncing: 49460ms

modified to chunks of 50 with 5 second waits
- syncing: 50484ms

Modified to chunked retry with an await timer
- syncing: 28730ms

Modified chunk to 99 per sync
- syncing: 22736ms

Modified to 40 per chunk
- syncing: 25015ms

Modified to 10 per chunk, no time out
- syncing: 25079ms

Set the rate limit to match what comes back in the request
- syncing: 25038ms
- This is most likely the best way since it's dynamically updated.

Same as above, ratePeriod / 2
- syncing: 37741ms

Same as above, rate period / 4
- syncing: 27397ms



## adjusting sync stats
Initial stats with the await changes.
- fullSync: 181823ms

reduced the rateCount by 10
- fullSync: 150091ms

turned the People module into two promises
- fullSync: 147895ms
- This actually hit an error

Turned the people module into it's own function
- fullSync: 103473ms

Turned People / Checkins / Giving into async functions
- fullSync: 109983ms
- fullSync: 150282ms
- Lots of clashing it appears since everything is trying to access the API at the same time.

await on People / Giving and ordered the others to the bottom
- fullSync: 143190ms

turned all values into a seperate promise function
- fullSync: 143089ms

Optimized the group sync function
- fullSync: 118591ms
- Can't rely on this because the giving sync didn't run.

Fixed bug where Giving did not properly run
- fullSync: 165533ms
- fullSync: 148049ms
- 


Full sync, optimized lists calls, no lists enabled
- fullSync: 127652ms
- fullSync: 124405ms
- 