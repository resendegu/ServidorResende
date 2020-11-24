const domain = 'meet.jit.si';
const options = {
    roomName: 'Resende151515151',
    width: 700,
    height: 700,
    parentNode: document.querySelector('#containerChamada'),
    
};
const api = new JitsiMeetExternalAPI(domain, options);

api.getAvailableDevices().then(devices => {
    
});

api.captureLargeVideoScreenshot().then(dataURL => {
    // dataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAA..."
});

api.getCurrentDevices().then(devices => {
    // devices = {
    //     audioInput: {
    //         deviceId: 'ID'
    //         groupId: 'grpID'
    //         kind: 'videoInput'
    //         label: 'label'
    //     },
    //     audioOutput: {
    //         deviceId: 'ID'
    //         groupId: 'grpID'
    //         kind: 'videoInput'
    //         label: 'label'
    //     },
    //     videoInput: {
    //         deviceId: 'ID'
    //         groupId: 'grpID'
    //         kind: 'videoInput'
    //         label: 'label'
    //     }
    // }
    
});

let listaParticipantes = api.getParticipantsInfo();