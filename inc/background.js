var hosts = undefined;
var error = undefined;
var refreshStatus = {state: false, error: undefined};

$("<div />").ajaxError(function() { debug_log('got ajax error'); });

function respond(resp, sendResponse)
{
  if ( sendResponse != undefined )
  sendResponse({state: resp.state, error: resp.error})

  refreshStatus.state = resp.state;
  refreshStatus.error = resp.error;
}

function refreshData(refreshStatus, sendResponse)
{
  console.log('refreshing data');
  error = undefined;
  refreshStatus.state = false;

  // basic info from user setup
  var username = window.localStorage.username;
  var password = window.localStorage.password;
  var url = window.localStorage.url;
  var url_base = window.localStorage.url_base;

  try {
    var modifiers = window.localStorage.ignoreCaseSensitivity === "false" ? "" : "i";
    var ignoreServicesRegexp = false;
    if ( typeof(window.localStorage.ignoreServicesRegexp) != 'undefined' && window.localStorage.ignoreServicesRegexp != "" ) {
      ignoreServicesRegexp = new RegExp (window.localStorage.ignoreServicesRegexp, modifiers);
    }
    var ignoreHostsRegexp = false;
    if ( typeof(window.localStorage.ignoreHostsRegexp) != 'undefined' && window.localStorage.ignoreHostsRegexp != "" ) {
      ignoreHostsRegexp = new RegExp (window.localStorage.ignoreHostsRegexp, modifiers);
    }
  } catch (e) {
    error = 'bad-regexp';
    respond({state: false, error: error}, sendResponse);
    errorBadge();
    return false;
  }

  // setup needs url
  if ( url == '' || url == undefined ) {
    debug_log('Url not defined');
    error = 'need-setup';

    // we need to handle response
    respond({state: false, error: error}, sendResponse);

    return false;
  }

  hosts = new Hosts();

  // url is ok, add host=all for now
  url = url+'?host=all&limit=0';

  // try to get data from icinga
  $.ajax({global: false, url: url,
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + window.btoa(username + ":" + password));
          },
          complete: function(res, status) {
      //respond({state: false, error: 'au'}, sendResponse);
      console.log(status);
      console.log(res);

      if ( res.status != 200 ) {
        switch(res.status)
        {
          case 404:
          error = 'bad-url';
          break;
          case 401:
          error = 'bad-auth';
          break;
          default:
          error = 'unknown';
        }
        respond({state: false, error: error}, sendResponse);
        return;
      }

      debug_log(res.getAllResponseHeaders());
      if ( status === "success" || status === "notmodified" ) {
        var selector = " .status > tbody > tr:gt(0)";

        // regular pro smazani obrazku
        //var rimg = /<img(.|\s)*?\/?>/gi;
        var rimg = /<img.*?src='([^']+)'.*?\/?>/gi;

        // nevim jestli by to neslo vic koser
        var obj = $("<div />");
        // TODO: potrebujeme ziskat url obrazku, tak neco lepsiho nez je smazat
        obj.html($("<div />").append(res.responseText.replace(rimg, "<span imgurl='$1' >").replace(/<script.*?>.*?<\/script>/gmi, '').replace(/<script/gmi, '<oldscript')).find(selector));

        var host = '';

        var service = '';
        var link = '';
        var ackService = false;
        var ackHost = false;
        var downtimeService = false;
        var downtimeHost = false;

        // browse rows
        obj.find("> tr").each( function(index, el) {
          ack = false;
          downtime = false;
          // browse cols
          $(el).find("> td").each( function(i, e) {
            // first col, we solve host
            if(i == 0)  {
              val = $(e).find("a").text();
              if ( val != '' ) {
                // get Host state
                var statusclass = $(this).attr('class');
                host = val;
                var href = $(e).find("a").attr('href');
                acked = $(e).find("span[imgurl*='ack.gif']").attr('imgurl');
                ackHost = ( acked == undefined ) ? false : true;
                downtimeed = $(e).find("span[imgurl*='downtime.gif']").attr('imgurl');
                downtimeHost = ( downtimeed == undefined ) ? false : true;

                // do not add hosts that we've ignored with regexp
                if (typeof(ignoreHostsRegexp) != 'object' || host.search(ignoreHostsRegexp) == -1) {
                  h = new Host(host, href);
                  // TODO: pridat kontrolu acku u hosta
                  hosts.addHost(h, statusclass, ackHost, downtimeHost);
                }
              }
            }
            // second col is service
            else if ( i == 1 ) {
              service = $(e).find("a").text();
              link = $(e).find("a").attr('href');
              acked = $(e).find("span[imgurl*='ack.gif']").attr('imgurl');
              ackService = ( acked == undefined ) ? false : true;
              downtimeed = $(e).find("span[imgurl*='downtime.gif']").attr('imgurl');
              downtimeService = ( downtimeed == undefined ) ? false : true;
            }
            // service status
            else if ( i == 2 ) {
              var state = $(e).text();

              // do not add services that we've ignored with regexp
              // also do not add those from ignored hosts
              if ((typeof(ignoreServicesRegexp) != 'object' || service.search(ignoreServicesRegexp) == -1)
                  && (typeof(ignoreHostsRegexp) != 'object' ||  host.search(ignoreHostsRegexp) == -1)) {
                s = new Service(service, link, state, ackService, downtimeService);
                hosts.getHost(host).addService(s);
                //debug_log("Found service: "+service+" with url "+href+" and state "+state);
              }
            }
            // other columns
            // 3 - last check
            // 4 - duration
            // 5 - attempt
            // 6 - status
          });
        });

        hosts.setBadge();

        respond({state: true, error: undefined}, sendResponse);
      } else {
        respond({state: false, error: 'unhandled state'}, sendResponse);
      }

    }});
}

var intervalId = undefined;

function setRefreshInterval()
{
  // clear old interval
  if ( intervalId != undefined )
  clearInterval(intervalId);

  // set refresh interval from options
  var refreshInterval = window.localStorage.refresh;

  if ( refreshInterval == undefined )
  refreshInterval = 30000;
  else
  refreshInterval *= 1000;

  // set refresh only if greater than 0
  if ( refreshInterval > 0 ) {
    console.log("Refresh interval set to "+refreshInterval+" miliseconds");
    intervalId = setInterval(function() { refreshData(refreshStatus); }, refreshInterval);
  }
}

// TODO: locking aby se nemlatilo s rucnim reloadem
refreshData(refreshStatus);
setRefreshInterval();

// REQUEST LISTENER
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

  // function for reporting what background script supports
  if(request.reqtype == 'supports') {
    var state = 'no';

    if ( request.what == 'dummy' )
    state = 'ok';

    sendResponse({state: state});

    // get stored data
  } else if ( request.reqtype == "get-data" ) {

    // we need setup first
    if ( error != undefined ) {
      if ( sendResponse != undefined )
      sendResponse({state: false, error: error});
      return;
    }
    else if ( hosts == undefined) {
      debug_log('Oooops, we have no data.');
      sendResponse({state: false});
      return;
    }

    resp = hosts.toJSON();
    resp.state = refreshStatus.state;
    resp.error = refreshStatus.error;
    sendResponse(resp);

    if ( refreshStatus.error )
    clearBadge();

    // refresh data
  } else if ( request.reqtype == "refresh-data" ) {
    refreshData(refreshStatus,sendResponse);
    setRefreshInterval();

    // reload background page
  } else if(request.reqtype == 'reload-background') {
    window.location.reload();

    // unknown request
  } else
  sendResponse({state: false, error: 'Unknown request'});

});
