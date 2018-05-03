Changelog
=========

0.1.6 - 12. 6. 2014
-------------------
  * New option to hide hosts and services in downtime
  * Fix not displaying acked hosts with not-acked services
  * Remove typo which broke links to hosts details (thanks to Michael Bladowski)
  * Memory leaks fixes, should be much more memory friendly

0.1.5 - 14. 3. 2014
-------------------
  * Fix flattr loading

0.1.4 - 14. 3. 2014
-------------------
  * Fix misplaced Save button
  * Remove unused includes in background
  * Async loading of donate buttons - fix problem with never appearing popup when flattr is down

0.1.3 - 14. 3. 2014
-------------------
  * Upgrade to manifest v2 and reupload to chrome store
  * Fix refresh interval changem
  * Fix #12 problem with limited host display
  * Fix #15 rescheduling date format problem

0.1.2 - 11. 7. 2012
-------------------
  * Fix wrong handling of empty regexps which probably caused non-working extension. See #13

0.1.1 - 28. 4. 2012
-------------------
  * New option: Hide acknowledged hosts and services in popup
  * Fixed problem when sometimes bad hosts were not displayed
  * Fixed wrong link to rate this extension

0.1.0 - 14. 1. 2012
-------------------
  * Added handling of downtimes
  * New future to ignore hosts/services with regular expressions (thanks to slawekp)
  * Filtering of host/services list
  * Small UI polishing

0.0.9 - 24. 8. 2011
-------------------
  * Quick fix for upgraded icinga 1.5
  * Added flattr button

0.0.8 - 24. 8. 2010
-------------------
  * Fix charset encoding issue on about page
  * Support for reloading background page

0.0.7 - 23. 8. 2010
-------------------
  * Small fix of wrong option page display

0.0.6 - 22. 8. 2010
-------------------
  * Fix displaying wrong status of host (Bug #5)
  * Support for acknowledge and reschedule of hosts

0.0.5 - 21. 8. 2010
-------------------
  * set refresh value in options
  * fix js error when using with icinga 1.0.3

0.0.4 - 23. 7. 2010
-------------------
  * support for rescheduling directly from popu
  * link to acknowledge service problem

