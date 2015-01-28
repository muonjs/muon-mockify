# Muon Mockify

Простой способ замокать ваш проект.

___

### Описание

Данный модуль призван упростить процесс интеграционного и юнит-тестирования Вашего проекта.
Модуль исходно разработан как часть среды интеграционного и юнит-тестирования веб-фреймворка [Muon.js](https://gitlab.muonapps.com/muonjs/muon), однако не зависет от него, поэтому Вы можете использовать muon-mockify для тестирования Ваших персональных проектов.

Модуль является надстройкой над методом `require` модуля `Module`, входящего в состав [Node.js](http://nodejs.org/api/modules.html#modules_module_require_id), и позволяет замещать экспортируемые модули на их mock-аналоги.

### Установка

Для включения модуля в Ваш NPM-проект следует выполнить:

```js
$ npm install --save-dev muon-mockify
```
Если Вы намерены использовать последню версию из GIT:

```js
$ git clone https://gitlab.muonapps.com/muon-group/muon-mockify
$ npm install

$ npm test # xUnit-отчет о выполнении тестов будет помещен в файл ./reports/xunit.xml
$ npm run-script systemtest # xUnit-отчет о выполнении системных тестов будет помещен в файл ./reports/xunit-system.xml

$ npm link . # создаст глобальную ссылку на NPM модуль в системе, могут потребоваться права администратора

# далее в Вашем проекте
$ npm link muon-mockify
```

### Спецификация и интерфейс

Mockify выполняет подмену базового загрузчика модулей `require`, устанавливая поверх него специальную функцию-враппер, которая выполняет поиск mock-модулей в директории `./mock_modules` в корне проекта (либо в директориях определеннных методами `setMockifyDir` и `addMockifyDir`, далее везде **MOCKIFY_DIR**), и в случае успеха, замещает экспорт модуля соответствующим mock-объектом, либо объектом, переданным в mockify напряму через метод `mockify.enableMock`.

#### Содержимое MockifyDir. Правила соответствия имен.

Далее будет использоваться следующая структура проекта для примеров:
```sh
$ tree .
 |- lib/
 |- |--- mymodule.js
 |- main.js
 |- mock_modules/
 |- |--- lib/
 |- |--- |--- mymodule.js
 |- |--- node_modules/
 |- |--- |--- foo.js
 |- |--- |--- foo/
 |- |--- |--- |--- optional.js
 |- |--- |--- http.js
 |- node_modules/
 |- |--- foo/
 |- |--- |--- lib/
 |- |--- |--- |--- foo.js
 |- |--- |--- main.js           # require("foo")
 |- |--- |--- optional.js       # require("foo/optional")
 |- |--- |--- package.json      # main запись ссылается на main.js
 |- |--- muon-mockify/
 |- |--- |--- main.js
 |- package.json
 |- test/
 |- |--- test.js
```
В процессе поиска mock-объектов - кандидатов на замещения ориганиальных модулей, экспортируемых с помощью `require`, поиск будет осуществляться следующим образом:
- для *локальных модулей* проекта путь будет формироваться из значения: **MOCKIFY_DIR+<относительный путь к модулю>** по отношению к корневой директории проекта. При этом не имеет значения, какой относительный путь для экспорта модуля был передан в метод `require`.
- для *модулей-зависимостей (NPM-пакетов)*, а также *нативных модулей Node.js* путь будет определяться исходя из следующего значения: **MOCKIFY_DIR+"/node_modules"+<имя модуля>**.
- для *альтернативных модулей NPM-пакетов*, доступных через слэш, например, `require("foo/optional")` применяется правило формирования пути: **MOCKIFY_DIR+"/node_modules"+<имя модуля>+"/"+<путь к алтернативному модулю>**
- Для *внутренних локальных модулей сторонних NPM-пакетов* правила поиска не применяются, всегда возвращается оригинальный модуль.

**ВАЖНО**: При использовании `muon-mockify`, в частности при управлении директориями **MOCKIFY_DIR**, а также при определении, относится ли запрашиваемый модуль к проекту, или находится за его пределами и не должен быть замокан, используется текущая работчая директория процесса (Current Workin Directory: `process.cwd()`).
Если вы запускаете тесты не из корневой директории Вашего проекта, либо сменили CWD в процессе их выполнения , `muon-mockify` может работать некорректно.

Ниже представлена таблица сооветствия аргументов переданных в `require` и результирующих путей, по которым будет производиться поиск mock-объекта:

| имя файла, из которого выполняется `require` | аргумент `require` | результирующий путь |
| -------------------------------------------- | ------------------ | ------------------- |
| ./main.js | ./lib/mymodule | ./mock_modules/lib/mymodule |
| ./test/test.js | ../lib/mymodule | ./mock_modules/lib/mymodule |
| ./main.js | foo | ./mock_modules/node_modules/foo |
| ./main.js | foo/optional | ./mock_modules/node_modules/foo/optional |
| ./main.js | http | ./mock_modules/node_modules/http |
| ./node_modules/foo/optional.js | ./lib/foo | ./node_modules/foo/lib/foo |

Также следует учитывать, что в целях поддержки JavaScript-производных языков програмирования (например, CoffeeScript) расширения файлов в процессе поиска не учитываются. При этом, если в искомой директории будет обнаружен mock-модуль подходящий по имени, но с неизвестным расширением, будет выполнена попытка его экспорта, что в конечном счете приведет к ошибке.

#### Набор доступных методов:
- **mockfiy.enable( id | [ id ] )**

Активирует функцию-враппер для метода `require`. После вызова данного метода, любой вызов `require` будет предварительно выполнять поиск соответствующего mock-модуля в директориях **MOCKIFY_DIR**. Если такой модуль существует, то вместо запрашиваемого модуля будет экспортирован найденный mock-объект. Если **MOCKIFY_DIR** включает в себя несколько директорий, и при этом более чем одна из директорий содержит запрашиваемый mock-модуль, `require` вернет первый найденный объект в соответсвии с порядком объявления директорий. Если же ни в одной из директорий **MOCKIFY_DIR** mock-объект не был найден, метод вернет исходный запрашиваемый модуль, либо выбросит исключения, если последний также отстутствует.

```js
# ./main.js:
var mockify = require("muon-mockify");
mockify.enable();
var mymodule = require("./lib/mymodule");
var mymodule_alt = require("./lib/../lib/mymodule");
var mymodule_orig = mockify.original("mymodule");
var mymodule_mock = mockify.original("./mock_modules/lib/mymodule");
console.log(mymodule_orig === mymodule); // FALSE
console.log(mymodule_mock === mymodule); // TRUE
console.log(mymodule_alt === mymodule); // TRUE

var foo = require("foo");
var foo_orig = mockify.original("foo");
console.log(foo_orig === foo); // FALSE

var foo_opt = require("foo/optional");
var foo_opt_orig = mockify.original("foo/optional");
console.log(foo_opt_orig === foo_opt); // FALSE
```
В качестве опционального параметра в метод может быть передан путь к локальному модулю или имя внешнего модуля (либо список подобных путей и имен), для которых необходимо загружать mock-объкты. В этом случае функция враппер будет срабатывать только для указаных имен. 

**Пример:**<br>
```js
var mockify = require("muon-mockify");
mockify.enable("./lib/mymodule");   // или mockify.enable(["./lib/mymodule"]);
var mymodule = require("mymodule");
var mymodule_orig = mockify.original("mymodule");
console.log(mymodule_orig === mymodule); // FALSE

var foo = require("foo");
var foo_orig = mockify.original("foo");
console.log(foo_orig === foo); // TRUE

mockify.disable();
```
Повторное выполнение `mockify.enable` с аргументом добавит в список имен для поиска mock-объектов новые значения. При этом, если первый вызов был выполнен без аргумента, повторный вызов не будет иметь смысла и не приведет ни к каким изменениям.

&nbsp;
- **mockfiy.enableMock( path, mock )**

Также как и метод `mockify.enable` активирует враппер метода `require`, однако, вместо поиска модуля в файловой системе в директориях **MOCKIFY_DIR**, метод `require` вернет значение `mock`, переданное в качестве аргумента. Данный метод может быть вызван вместе с методом `mockify.enable`, при этом в процессе поиска mock-объекта приоритет будет за значением, переданным через `mockify.enableMock`.

**Пример:**<br>
```js
var mockify = require("muon-mockify");

var httpMock = {
    get: function(){},
    createServer: function(){}
}

mockify.enableMock("http",httpMock);
var http = require("http");
console.log(http === httpMock); // TRUE
```

&nbsp;
- **mockfiy.removeMock( [ id ] )**

Вызов данного метода отменяет действие вызова `mockify.enableMock` для имен и/или путей переданных в качестве аргумента, а также добавляет соответствующие имена в игнорируемый список в процессе поиска mock-модулей в файловой системе в директориях
**MOCKIFY_DIR**. Также метод очищает require кэш для указанных модулей, таким образом повторный экспорт указанных модулей приведет к их повторной загрузке и исполнению. Данный метод может быть полезен, когда требуется исключить из полного списка существующих mock-объектов, подключаемых через `mockify.enable`,  один или несколько модулей. 

**Пример:**<br>
```js
var mockify = require("muon-mockify");
mockify.enable();
mockify.removeMock("./lib/mymodule");
var mymodule = require("./lib/mymodule");
var mymodule_orig = mockify.original("./lib/mymodule");
console.log(mymodule_orig === mymodule); // TRUE
```

&nbsp;
- **mockfiy.disable()**

Отключает враппер `require`, а также очищает кэш загруженных модулей. Также отменяет все действия и фильтры, установленные методами `mockify.enable`, `mockify.enableMock` и `mockify.removeMock`.

&nbsp;
- **mockfiy.original( id )**

Выполняет вызов оригинального метода `require`, игнорируя все текущие параметры mockify. В случае, если враппер метод неактивен (методы `mockify.enable` или `mockify.enableMock` ниразу не использовались, либо был вызван `mockify.disable`), то вызов `mockify.original` выведет сооветствующее сообщение в `stderr`.

&nbsp;
- **mockfiy.getMockifyDirs() : [ path ]**

Возвращает список текущих путей поиска **MOCKIFY_DIR** mock-объектов. 

&nbsp;
- **mockfiy.setMockifyDir( path | [path] )**

Сбрасывает текущее значение и устанавливает новый путь либо список путей **MOCKIFY_DIR**. Порядок указания директорий опредяляет приоритет путей (по-убыванию) в процессе поиска mock-модулей.  Если одна из устанавливаемых директорий отсутствует, соответствующее сообщение будет выведено в `stderr`.

**Пример:**
```js
var mockfiy = require("muon-mockify");
console.log(mockify.getMockifyDirs());
// ['/home/user/foo_project/mock_modules']

mockify.setMockifyDir(["/opt/nodejs/mocks","../local/mocks"]);
console.log(mockify.getMockifyDirs());
// ['/opt/nodejs/mocks','/home/user/local/mocks']
```

&nbsp;
- **mockfiy.addMockifyDir( path | [path] )**

Добавляет новые пути в **MOCKIFY_DIR** для поиска mock-модулей. Порядок указания директорий опредяляет приоритет путей (по-убыванию) в процессе поиска mock-модулей.  Если одна из устанавливаемых директорий отсутствует, соответствующее сообщение будет выведено в `stderr`.

**Пример:**
```js
var mockfiy = require("muon-mockify");
console.log(mockify.getMockifyDirs());
// ['/home/user/foo_project/mock_modules']

mockify.addMockifyDir(["/opt/nodejs/mocks","../local/mocks"]);
console.log(mockify.getMockifyDirs());
// ['/home/user/foo_project/mock_modules','/opt/nodejs/mocks','/home/user/local/mocks']
```

&nbsp;
- **mockfiy.resetMockifyDir()**

Устанавливает в качестве единственного текущего пути **MOCKIFY_DIR** значение по умолчанию: `./mock_modules` в корне проекта.

### Примеры тестов

Ниже приведен небольшой туториал - пример тестирования примитивного HTTP клиента, работающего поверх нативного Node.js модуля `http`.

```js
# ./lib/myhttpclient.js

var http = require("http");

exports.get = function(url,callback){
    http.get(url,function(resp){
        var chunks = [];
        resp.on("data",function(chunk) {
            chunks.push(chunk)
        }).on("end",function(){
            callback(null,resp.status,Buffer.concat(chunks).toString("utf-8"));
        });
    }).on("error",callback);
}
```

Очевидно, для тестирования подобного модуля требуется сетевая часть, которая выполнит HTTP-запрос. Чтобы не тратить время на организацию тестового веб-сервера, и также не зависить от внешних факторов, способных повлиять на успешность выполнения тестов (например, доступность сети, доступность запрашиваемого сервера с тестовыми данными, валидность получаемых данных и т.д.) нам потребуется создать mock-объект для модуля `http`.

```js
# ./test/http-mock.js

var Readable = require("stream").Readable,
    _ = require("underscore"),
    util = require("util");

/// Реализация поведения IncommingMessage модуля 'http'
function IncomingMessageMock(status,data){
    Readable.apply(this,arguments);
    this.__offset = 0;
    this.status = status;
    this.headers = {};
    this.__data = data;
}
util.inherits(IncomingMessageMock,Readable);
_.extend(IncomingMessageMock.prototype,{
    _read: function(size){
        var ret = Buffer([].slice.apply(Buffer(this.__data),[this.__offset,this.__offset+size]));
        if (ret.length == 0) return this.push(null);
        this.__offset += size;
        this.push(ret);
    }
});

/// Настраиваемый mock-класс имитирующий поведение модуля 'http'.
/// httpMockStatus и httpMockRet - то что безусловно должен вернуть HTTP клиент
module.exports = function HttpMock(httpMockStatus,httpMockRet){
    _.extend(this,{
        get: function(url,callback){
            callback(new IncomingMessageMock(httpMockStatus,httpMockRet))
        }
    });
}
```

Теперь мы готовы написать сам тест совместно с `muon-mockify`:

```js
# ./test/httpclientTest.js

require("chai").should();
var expect = require("chai").expect,
    mockify = require("muon-mockify");

describe("test case for HTTP Mock",function(){

    // Исходные данные
    var httpMockRet = "<strong>Success</strong>",
        httpMockStatus = 200,
        HttpMock = require("./http-mock");
        
    var retData, retStatus, retErr;
    
    before(function() {
        /// Активируем враппер require и замещаем модуль 'http' mock-объектом
        mockify.enableMock("http",new HttpMock(httpMockStatus,httpMockRet));
    });
    
    // Выполняем метод
    before(function(done){
        mockify.original("./lib/myhttpclient").get("http://foo.bar",function(err,status,data){
            retErr = err;
            retData = data;
            retStatus = status;
            done();
        });
    });
    
    // Выполняем серию проверок
    it("err should be null",function(){
        expect(retErr).to.be.a("null");
    });  
  
    it("data should exist",function(){
        expect(retData).to.be.a("string");
    });
    
    it("status should exist",function(){
        expect(retStatus).to.be.a("number");
    });
    
    it("data should be success",function(){
        retData.shoud.be.equal(httpMockRet);
    });
    
    it("status should be ok",function(){
        retStatus.shoud.be.equal(httpMockStatus);
    });
    
    // Отключаем враппер, чтобы не влиять на другие тесты
    after(mockify.disable);
});
```
В определенный момент Вам станет ясно, что реализация mock-модуля HttpMock (и любых других подобных модулей) стала достаточно универсальной, и Вы можете использовать ее также в остальных сетевых тестах. Тогда соответствующий модуль будет целесообразно поместить в **MOCKIFY_DIR**.

Теперь предположим, что у нас есть еще один модуль, который выполняет обработку данных, полученных с помощью нашего же HttpClient.
```js
# ./lib/dataproc.js

var httpClient = require("./myhttpclient");

exports.jsonify = function(source,callback) {
    httpClient.get(source,function(err,status,data) {
        if (!!err) return callback(err);
        if (status != 200) return callback({ status: status, message: "data source is not available"});
        try {
            callback(null,JSON.parse(data));
        }
        catch(e){
            callback(e);
        }
    });
}
    
exports.xmlify = function(source,callback) {
    ...
}

```

Для тестирования данного модуля нам потребуется mock-реализация локального модуля HttpClient:
```js
# ./mock_modules/lib/myhttpclient.js

var mockErr,mockStatus,mockData; 
exports.setup = function(err,status,data){
    mockStatus = status;
    mockData = data;
}

exports.get = function(source,callback) {
    callback(mockErr,mockStatus,mockData);
}
```

В отличии от HttpMock модуля, мы создали настраиваемый вариант mock-объекта и разместили в директории **MOCKIFY_DIR**. По этому сам тест может быть немного упрощен:
```js
# ./test/dataprocTest.js


require("chai").should();
var expect = require("chai").expect,
    mockify = require("muon-mockify");

describe("test case for data processor",function(){
    var dummySource = "http://foo.bar",
        initialStatus = 200,
        initialData = "{ \"status\": \"Success\" }",
        initialObject = JSON.parse(initialData),
        testError,testObject;
        
    // Подключаем MOCKIFY_DIR и настраиваем mock-объект
    before(function(){
        mockify.enable();
        require("../lib/myhttpclient.js").setup(null,initialStatus,initialData);
    });
    
    // Запускаем сценарий
    before(function(done) {
        mockify.original("../lib/dataproc.js").jsonify(dummySource,function(err,data){
            testError = err;
            testData = data;
            done();
        });
    });
    
    // Проверяем результат
    it("err should be a null",function(){
        expect(testError).to.be.a("null");
    });
    
    it("ret data should match to initial object",function(){
        testObject.should.be.equal(initialObject);
    });
    
    // Отключаем враппер
    after(mockify.disable);
});
```

и так далее..

#### Что дальше...

В последствии при создании сьюит юнит-тестов Вы сможете определить глобальный `setup` и `teardown` методы, которые будут активировать враппер `require`.
Доступ к тестрируемому модулю следует выполнять с помощью метода `mockify.original`. Для `mocha` тестов это будет выглядеть примерно следующим образом:

```js
describe("unit test suite",function(){
    before(function(){
        mockify.enable();
    });
    
    describe("test case for ./mymodule1",function(){
        before(function() {
            mockify.original("../lib/mymodule1").run( ... );
        });
        
        it ("check it" ,function() { ... });
    });
    
    describe("test case for ./mymodule2",function(){
        before(function() {
            mockify.original("../lib/mymodule2").run( ... );
        });
        
        it ("check it" ,function() { ... });
    });
    
    ...
    
    after(mockify.disable);
});
```

Помимо этого вы также можете создавать отдельные сьюиты с независимыми тестовыми сценариями.
В сложном проекте это может быть удобно для тестирования отдельных значимых аспектов поведения программного продукта.
Добиться этого можно, используя наборы mock-модулей с согласованным поведением и (или) набором тестовых данных, 
помещенных в отдельные переключаемые директории **MOCKIFY_DIR**.

____

#### Лицензия

Исходный код данного проекта распространяется под лицензией MIT.
