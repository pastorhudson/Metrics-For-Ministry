# Changelog

## [Unreleased](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/HEAD)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.4.0...HEAD)

**Fixed bugs:**

- With changes in v1.4.1 it does not properly run the sheets setup [\#92](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/92)
- Failures in syncing do not properly stop the checkStatus interval [\#87](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/87)
- "Out of Memory Error" - Failed at syncing Giving - Anne Yates [\#86](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/86)
- "Out of Memory Error" - Failed syncing people profiles - Adam - First church [\#85](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/85)
- 'Error: Exception: The coordinates of the range are outside the dimensions of the sheet.' [\#83](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/83)
- V1.4.1 [\#95](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/95) ([coltoneshaw](https://github.com/coltoneshaw))
- V1.4.1 [\#93](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/93) ([coltoneshaw](https://github.com/coltoneshaw))

**Merged pull requests:**

- Made the error message here more clear. \#84 [\#94](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/94) ([coltoneshaw](https://github.com/coltoneshaw))
- V1.4.1 [\#91](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/91) ([coltoneshaw](https://github.com/coltoneshaw))

## [v1.4.0](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.4.0) (2021-04-06)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.3.0...v1.4.0)

**Implemented enhancements:**

- Enhancement: Set the Checkins connector to utilize parent locations. [\#64](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/64)
- Enhancement: Improve the data calls to use the includes [\#63](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/63)
- Enhancement: Better script logging and tracking of usage. [\#34](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/34)
- Enhancement: Redo the GetList function. [\#32](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/32)

**Closed issues:**

- Feature: Add a date limit to the PCO Sync [\#31](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/31)

**Merged pull requests:**

- Updated changelog and readme [\#75](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/75) ([coltoneshaw](https://github.com/coltoneshaw))
-  Fixes \#56. Created the Groups connector [\#74](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/74) ([coltoneshaw](https://github.com/coltoneshaw))
- V1.3.0 [\#73](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/73) ([coltoneshaw](https://github.com/coltoneshaw))
- V1.4.0 [\#80](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/80) ([coltoneshaw](https://github.com/coltoneshaw))

## [v1.3.0](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.3.0) (2021-02-20)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.2.1...v1.3.0)

**Implemented enhancements:**

- Feature: -1 for people without ages, age range "Not Assigned" [\#71](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/71)
- Enhancement: Adjust the sync time to be 3-4am [\#66](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/66)
- Enhancement: Additional data source under People for simply the lists [\#65](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/65)
- Enhancement: Create Group Sync [\#56](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/56)
- Enhancement: Need to create Check-ins sync to pull the check-in data. [\#55](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/55)

**Fixed bugs:**

- Bug: The list ID is not pulled in the GDS integration [\#68](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/68)
- Bug: List People syncs all people, not just the checked lists. [\#67](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/67)

**Merged pull requests:**

- Updating bugs within Lists [\#69](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/69) ([coltoneshaw](https://github.com/coltoneshaw))

## [v1.2.1](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.2.1) (2021-02-12)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.2.2...v1.2.1)

## [v1.2.2](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.2.2) (2021-02-12)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.2.0...v1.2.2)

**Fixed bugs:**

- Bug: Issue where the update script will loop through infinity. [\#57](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/57)

**Merged pull requests:**

- Fixed a bug in the update script where it would loop through infinity [\#58](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/58) ([coltoneshaw](https://github.com/coltoneshaw))

## [v1.2.0](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.2.0) (2021-02-11)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.1.0...v1.2.0)

**Implemented enhancements:**

- Enhancement: Create the ability to sync specific modules [\#49](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/49)
- Enhancement: Sidebar enhancements [\#48](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/48)
- Enhancement: Add a date column to Giving that's converted to local time [\#46](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/46)
- Enhancement: Improve the landing page after OAuth. [\#44](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/44)
- Enhancement: Rename the tabs to be more user centric [\#43](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/43)
- Enhancement: Modify the GDS connector to accept Spreadsheet IDs [\#42](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/42)
- Enhancement: Create the GDS addon to not use any userProperties [\#40](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/40)
- Enhancement: Create a trigger when the sheet is opened for updates [\#38](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/38)

**Fixed bugs:**

- Enhancement: Need to look into throwing a UI error if the sync fails. [\#53](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/53)
- Bug: Triggers are created under the HEAD which causes issues when they run [\#52](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/52)

**Closed issues:**

- Feature: enable data syncing to use the `updated_at` attribute. [\#30](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/30)

**Merged pull requests:**

- v1.2.0 [\#54](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/54) ([coltoneshaw](https://github.com/coltoneshaw))

## [v1.1.0](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.1.0) (2021-02-09)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/v1.0.8...v1.1.0)

**Implemented enhancements:**

- Enhancement: Move OAuth tokens to be a script property. [\#39](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/39)
- Enhancement: Freeze the top row [\#35](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/35)

**Fixed bugs:**

- Bug: If user deletes the info, the age column auto formats as a date, not number [\#28](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/28)
- Bug: if a user has not set up the add-on they get an error on GDS [\#27](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/27)
- Bug: If donor is anonymous the giving function fails [\#37](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/37)

**Merged pull requests:**

- Beta 1.1.0 [\#45](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/45) ([coltoneshaw](https://github.com/coltoneshaw))

## [v1.0.8](https://github.com/coltoneshaw/Metrics-For-Ministry/tree/v1.0.8) (2021-01-21)

[Full Changelog](https://github.com/coltoneshaw/Metrics-For-Ministry/compare/76fd2b619757f179cd7de20de98ece9587f17954...v1.0.8)

**Closed issues:**

- PCO Checkins Integration [\#8](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/8)
- PCO Giving Integration [\#7](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/7)
- PCO People to Google Integration & Initial Build [\#6](https://github.com/coltoneshaw/Metrics-For-Ministry/issues/6)

**Merged pull requests:**

- Beta 1.0.8 [\#26](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/26) ([coltoneshaw](https://github.com/coltoneshaw))
- Beta 1.0.7 [\#25](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/25) ([coltoneshaw](https://github.com/coltoneshaw))
- Beta 1.0.6 [\#24](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/24) ([coltoneshaw](https://github.com/coltoneshaw))
- Beta V5 [\#23](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/23) ([coltoneshaw](https://github.com/coltoneshaw))
- Production [\#22](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/22) ([coltoneshaw](https://github.com/coltoneshaw))
- Merge pull request \#20 from coltoneshaw/main [\#21](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/21) ([coltoneshaw](https://github.com/coltoneshaw))
- Merge pull request \#19 from coltoneshaw/production [\#20](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/20) ([coltoneshaw](https://github.com/coltoneshaw))
- modifications for production [\#19](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/19) ([coltoneshaw](https://github.com/coltoneshaw))
- building signin screen and deleting the sheets upon signout [\#18](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/18) ([coltoneshaw](https://github.com/coltoneshaw))
- progress bar, clearing rows, date selector, sync status, and more. [\#17](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/17) ([coltoneshaw](https://github.com/coltoneshaw))
- New sidebar, org data, timezone [\#16](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/16) ([coltoneshaw](https://github.com/coltoneshaw))
- Adding the PCO Checkins module sync [\#15](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/15) ([coltoneshaw](https://github.com/coltoneshaw))
- Updates to campus name, payment channel, and data type [\#14](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/14) ([coltoneshaw](https://github.com/coltoneshaw))
- Updates to giving module and people [\#13](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/13) ([coltoneshaw](https://github.com/coltoneshaw))
- Updating birthday/Age, adding sync, and more. [\#12](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/12) ([coltoneshaw](https://github.com/coltoneshaw))
- Local master [\#11](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/11) ([coltoneshaw](https://github.com/coltoneshaw))
- Working people connector [\#10](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/10) ([coltoneshaw](https://github.com/coltoneshaw))
- completed List Sync [\#9](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/9) ([coltoneshaw](https://github.com/coltoneshaw))
- Working async calls and tab updates [\#5](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/5) ([coltoneshaw](https://github.com/coltoneshaw))
- Working PCO API promise call [\#4](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/4) ([coltoneshaw](https://github.com/coltoneshaw))
- refactored the list class [\#3](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/3) ([coltoneshaw](https://github.com/coltoneshaw))
- clasp file [\#2](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/2) ([coltoneshaw](https://github.com/coltoneshaw))
- Initial Commit [\#1](https://github.com/coltoneshaw/Metrics-For-Ministry/pull/1) ([coltoneshaw](https://github.com/coltoneshaw))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
