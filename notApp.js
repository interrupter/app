String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var notApp = function (notManifest) {
    this._notOptions = notManifest;
    this._working = {
        interfaces: {},
        controllers: {},
        initController: null,
    };
}

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
}

notApp.prototype._update = function () {
    //нужно инициализировать
    //модели полученными интерфейсами
    this._updateInterfaces();
    //иницилицировать и запустить контроллер инициализации
    this._initController();
    //создать контроллеры
    this._initRouter();
    //роутер и привязать к нему контроллеры


}

notApp.prototype._bindController = function(controllerName){
    var ctrl = new notController(this, controllerName);
    return function(param){
        return ctrl.exec(param);
    }
}

notApp._initController = function(){
    if (typeof (this._notOptions.initController)!=='undefined'){
        this._working.initController = new notController(this, this._getControllerName(this._notOptions.initController));
        this._working.initController.exec();
    }
}

notApp.prototype._initRouter = function(){
    var routieInput = {}, that = this;
    $.each(this._notOptions.siteManifest, function(route, controllerName){
        routieInput[route] = that._bindController(controllerName);
    });
    //console.log(routieInput);
    this._working.router = routie(routieInput);
}

notApp.prototype._updateInterfaces = function () {
    this._clearInterfaces();
    if (this._notOptions.hasOwnProperty('interfaceManifest'))
        $.each(this._notOptions.interfaceManifest, this._initInterface.bind(this));
}

notApp._getControllerName = function(name){
    return 'nr'+(name.capitalizeFirstLetter());
}

notApp.prototype._initInterface = function (index, manifest) {
//    console.log(index, manifest);
    this._working.interfaces[this._getControllerName(index)] = new  notRecord(manifest);
}

notApp.prototype._getInterfaces = function (index, manifest) {
    return this._working.interfaces;
}

notApp.prototype._clearInterfaces = function () {
    this._working.interfaces = {};
}
