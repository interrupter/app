String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var notApp = function (notManifest) {
    this._notOptions = notManifest;
    this.resources = {};
    this._working = {
        interfaces: {},
        controllers: {},
        initController: null,
        currentController: null,
        forms:  {}
    };
};

notApp.prototype.exec = function () {
    var url =this._notOptions.interfaceManifestURL,
        success = this._setInterfaceManifest.bind(this);
    $.ajax({
        dataType: "json",
        data: '',
        url: url,
        success: success
    });
};

notApp.prototype._setInterfaceManifest = function (data) {
    this._notOptions.interfaceManifest = data;
    this._update();
};

notApp.prototype._getInterfaceManifest = function () {
    return this._notOptions.interfaceManifest;
};

notApp.prototype._update = function () {
    //нужно инициализировать
    //модели полученными интерфейсами
    this._updateInterfaces();
    //иницилицировать и запустить контроллер инициализации
    this._initController();
    //создание объектов автогенерация форм
    this._initFormBuilders();
    if (this.allResourcesReady()){
        this.startApp();
    }
};

notApp.prototype.startApp = function(){
    //создать контроллеры
    //роутер и привязать к нему контроллеры
    this._initRouter();
};

notApp.prototype._bindController = function(controllerName){
    var ctrl = new notController(this, controllerName);
    return function(param){
        return ctrl.exec(param);
    }
};

notApp.prototype._initController = function(){
    if (typeof (this._notOptions.initController)!=='undefined'){
        this._working.initController = new notController(this, this._notOptions.initController);
        this._working.initController.exec();
    }
};

notApp.prototype._initRouter = function(){
    var routieInput = {}, that = this;
    $.each(this._notOptions.siteManifest, function(route, controllerName){
        routieInput[route] = that._bindController(controllerName);
    });
    //console.log(routieInput);
    this._working.router = routie(routieInput);
};

notApp.prototype._getCurrentController = function(){
    return this._working.currentController;
};

notApp.prototype._setCurrentController = function(ctrl){
    this._working.currentController = ctrl;
    return this;
};

notApp.prototype._updateInterfaces = function () {
    this._clearInterfaces();
    if (this._notOptions.hasOwnProperty('interfaceManifest')){
        $.each(this._notOptions.interfaceManifest, this._initInterface.bind(this));
    }
};

notApp.prototype._getRecordName = function(name){
    return 'nr'+name.capitalizeFirstLetter();
};

notApp.prototype._getControllerName = function(name){
    return 'nc'+name.capitalizeFirstLetter();
};


notApp.prototype._initInterface = function (index, manifest) {
    console.log(index, manifest);
    this._working.interfaces[this._getRecordName(index)] = new notRecord(manifest);
};

notApp.prototype._getInterfaces = function () {
    return this._working.interfaces;
};

notApp.prototype._clearInterfaces = function () {
    this._working.interfaces = {};
};

notApp.prototype._initFormBuilders = function(){
    this._clearFormBuilders();
    if (this._notOptions.hasOwnProperty('forms')){
        $.each(this._notOptions.forms, this._initFormBuilder.bind(this));
    }
};

notApp.prototype._initFormBuilder = function(index, manifest){
    console.log('init form builder', index,  manifest);
    this._working.forms[index] = new notForm(this, manifest);
    this._working.forms[index].init(this.waitThisResource('form', index));
};

notApp.prototype._getFormBuilders = function(){
    return this._working.forms;
};

notApp.prototype._clearFormBuilders = function(){
    this._working.forms = {};
};

notApp.prototype.waitThisResource = function(type, index){
    if (!this.resources.hasOwnProperty(type)){
        this.resources[type]    = {};
    }
    this.resources[type][index] = false;
    return this.onResourceReady.bind(this, type, index);
};

notApp.prototype.onResourceReady = function(type, index){
    this.resources[type][index] = true;
    if (this.allResourcesReady()){
        this.startApp();
    }
};

notApp.prototype.allResourcesReady = function(){
    var i, j;
    for(i in this.resources){
        for (j in this.resources[i]){
            if (!this.resources[i][j]){
                return false;
            }
        }
    }
    return true;
};
