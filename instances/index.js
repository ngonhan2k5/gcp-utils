process.env.GOOGLE_APPLICATION_CREDENTIALS="authen.json"
// BEFORE RUNNING:
// ---------------
// 1. If not already done, enable the Compute Engine API
//    and check the quota for your project at
//    https://console.developers.google.com/apis/api/compute
// 2. This sample uses Application Default Credentials for authentication.
//    If not already done, install the gcloud CLI from
//    https://cloud.google.com/sdk and run
//    `gcloud beta auth application-default login`.
//    For more information, see
//    https://developers.google.com/identity/protocols/application-default-credentials


const {google} = require('googleapis');
const compute = google.compute('v1');

authorize(function(authClient) {
  var request = {
    // Project ID for this request.
    project: authClient.projectId, //'praxis-practice-273019',  // TODO: Update placeholder value.

    // The name of the zone for this request.
    zone: 'us-central1-a',  // TODO: Update placeholder value.

    auth: authClient,
    // query: {filter:"name=instance-1"}
  };

  let instances = []

  var handlePage = function(err, response) {
    if (err) {
      console.error(err);
      return;
    }
    var itemsPage = response.data['items'];
    if (!itemsPage) {
      return;
    }
    for (let {name, status} of itemsPage) {
      instances.push({name, status})
      //console.log(JSON.stringify(itemsPage[i], null, 2));
    }
    

    if (response.nextPageToken) {
      request.pageToken = response.nextPageToken;
      compute.instances.list(request, handlePage);
    }else{
        // console.log(instances)
        prc(instances, request)
    }
  };

  compute.instances.list(request, handlePage);

  
});
/**
 * 
 * @param {*} instances 
 * @param {*} request 
 */
function prc(instances, request){
    let args = process.argv.slice(2)
    let inst = Instances.of(instances, request);
    console.log(args);
    let cmd = args.shift()
    switch (cmd.toLowerCase()) {
        case 'start':
            if (args[0]=='all'){
                inst.onlyStatus('TERMINATED').start();
            }else{
                inst.only(args).onlyStatus('TERMINATED').start();
            }
            break;
        case 'stop':
            if (args[0]=='all'){
                inst.onlyStatus('RUNNING').stop();
            }else{
                inst.only(args).onlyStatus('RUNNING').stop();
            }
            break;
        case 'list':
            if (args.length){
                let match = new RegExp(args[0]);
                console.log(inst.only(match).items);
            }else{
                console.log(instances);
            }
            break;
    }

}
/**
 * 
 */
class Instances {
    constructor(items, req){
        this.items = items;
        this.req = req;
    }

    static of(items, request){
        return new Instances(items, request);
    }

    onlyStatus(status){
        this.items = this.items && this.items.filter((i)=>i.status==status);
        return this;
    }

    only(names){
        if (names instanceof RegExp){
            this.items = this.items && this.items.filter((i)=> i.name.match(names));
        }else if (names instanceof Array){
            this.items = this.items && this.items.filter((i)=> names.indexOf(i.name)>-1);
        }
        return this;
    }

    start(){
        for (let {name} of this.items){
            let req = {...this.req, instance:name}
            console.log('Starting:' + name);
            compute.instances.start(req, function(err, response) {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log('Started:' + name);
                console.log(JSON.stringify(response, null, 2));
              });
        }
        return this;
    }

    stop(){
        for (let {name} of this.items){
            let req = {...this.req, instance:name}
            console.log('Stoping:' + name);
            compute.instances.stop(req, function(err, response) {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log('Stopped:' + name);
                console.log(JSON.stringify(response, null, 2));
              });
        }
        return this;
    }
}

function authorize(callback) {
  google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  }).then(client => {
    callback(client);
  }).catch(err => {
    console.error('authentication failed: ', err);
  });
}

