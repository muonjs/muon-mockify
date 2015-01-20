# Muon Mockify

Простой способ замокать ваш проект.

___

### Описание

Данный модуль призван упростить процесс интеграционного и юнит-тестирования Вашего проекта.
Модуль исходно разработан как часть среды интеграционного и юнит-тестирования веб-фреймворка [Muon.js](https://gitlab.muonapps.com/muonjs/muon), однако не зависит от него, поэтому Вы можете использовать muon-mockify для тестирования Ваших персональных проектов.

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
$ npm test
$ npm link . # создаст глобальную ссылку на NPM модуль в системе, могут потребоваться права администратора

# далее в Вашем проекте
$ npm link muon-mockify
```

### Спецификация и интерфейс

Mockify выполняет подмену базового загрузчика модулей `require`, устанавливая поверх него специальную функцию-враппер, которая выполняет поиск mock-модулей в директории `./mock_modules` в корне проекта (либо в директориях определеннных методами `setMockifyDir` и `addMockifyDir`, далее везде **MOCKIFY_DIR**), и в случае успеха, замещает экспорт модуля соответствующим mock-объектом, либо объектом, переданным в mockify напряму через метод `mock`.

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

Ниже представлена таблица сооветствия аргументов переданных в `require` и результирующих путей, по которым будет производиться поиск mock-объекта:

| имя файла, из которого выполняется `requrie` | аргумент `require` | результирующий путь |
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
- **mockfiy.mock( path, mock )**

Также как и метод `enable` активирует враппер метода `require`, однако, вместо поиска модуля в файловой системе в директориях **MOCKIFY_DIR**, метод `require` вернет значение `mock`, переданное в качестве аргумента. Данный метод может быть вызван вместе с методом `mockify.enable`, при этом в процессе поиска mock-объекта приоритет будет за значением, переданным через `mockify.mock`.

**Пример:**<br>
```js
var mockify = require("muon-mockify");

var httpMock = {
    get: function(){},
    createServer: function(){}
}

mockify.mock("http",httpMock);
var http = require("http");
console.log(http === httpMock); // TRUE
```

&nbsp;
- **mockfiy.unmock( [ id ] )**

Вызов данного метода отменяет действие вызова `mockify.mock` для имен и/или путей переданных в качестве аргумента, а также добавляет соответствующие имена в игнорируемый список в процессе поиска mock-модулей в файловой системе в директориях
**MOCKIFY_DIR**. Также метод очищает require кэш для указанных модулей, таким образом повторный экспорт указанных модулей приведет к их повторной загрузке и исполнению. Данный метод может быть полезен, когда требуется исключить из полного списка существующих mock-объектов, подключаемых через `mockify.enable`,  один или несколько модулей. 

**Пример:**<br>
```js
var mockify = require("muon-mockify");
mockify.enable();
mockify.unmock("./lib/mymodule");
var mymodule = require("./lib/mymodule");
var mymodule_orig = mockify.original("./lib/mymodule");
console.log(mymodule_orig === mymodule); // TRUE
```

&nbsp;
- **mockfiy.disable()**

Отключает враппер `require`, а также очищает кэш загруженных модулей. Также отменяет все действия и фильтры, установленные методами `mockify.enable`, `mockify.mock` и `mockify.unmock`.

&nbsp;
- **mockfiy.original( id )**

Выполняет вызов оригинального метода `require`, игнорируя все текущие параметры mockify. В случае, если враппер метод неактивен (методы `mockify.enable` или `mockify.mock` ниразу не использовались, либо был вызван `mockify.disable`), то вызов `mockify.original` выведет сооветствующее сообщение в `stderr`.

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

### Примеры тестов на Mocha

Ниже приведена пара абстрактных примеров тестов на Mochа и Chai с использованием muon-mockify:

```js
require("chai").should();
var expect = require("chai").expect;

describe("test case #1",function(){
    var mockify = require("muon-mockify"),
        testModule = require("../lib/mymodule"),
        retData, retError, initialData;
    
    before(mockify.enable);
    before(function(){
        // some set up here
    });
    
    before(function(done){
        testModule.run(function(err,data){
            retData = data;
            retError = err;
            done();
        });
    });
  
    it("err should be null",function(){
        expect(retError).to.be.a("null");
    });
    
    it("test data be ok",function(){
        testModule.shoud.be.equal(initialData);
    });
    
    after(function(){
        // tear down here
    });
    
    after(mockify.disable);
});
```

Более сложный пример:

```js
require("chai").should();
var expect = require("chai").expect,
    var util = require("util"),
    mockify = require("muon-mockify"),
    Readable = require("stream").Readable;

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

describe("test case #2 for HTTP Mock",function(){
    
    var httpMockRet = "<strong>Success</strong>",
        httpMockStatus = 200,
        httpMock = {
            get: function(url,callback){
                callback(new IncomingMessageMock(httpMockStatus,httpMockRet))
            }
        },
        retData, retStatus;
    
    before(function() {
        mockify.mock("http",httpMock);
    }
    
    before(function(){
        mockify.original("./lib/myajaxclient").get("http://foo.bar",function(status,data){
            retData = data;
            retStatus = status;
        });
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
    
    after(mockify.disable);
});
```

____

#### Лицензия

Исходный код данного проекта распространяется под лицензией MIT.