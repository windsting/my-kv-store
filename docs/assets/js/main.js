

function apiUrl() {
    let aApiUrl = document.getElementById("api-url");
    return aApiUrl.href;
}

function key() {
    let inputKey = document.getElementById("key");
    return inputKey.value;
}

function notify(message, result) {
    let tc = "bg-danger-subtle";
    if (result === "succeed"){
        tc = "bg-success-subtle"
    } else {
        result = "failed";
    }
    let toastInfo = {
        header: result,
        body: message,
        delay: 8000,
        toastClass: tc
    };
    // console.log(toastInfo);
    bootstrap.showToast(toastInfo);
    // alert(message);
}

function get(url, key, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = (event) => {
        if (xhr.status != 200) {
            notify(`Get operation got error: ${xhr.status}`);
            console.log(event);
            return;
        }
        const response = xhr.responseText;
        let data = JSON.parse(response);
        if (!data.hasOwnProperty('data')) {
            notify(`Result of Get: ${data.result}(${data.desc})`, data.result);
            return;
        }
        let time = new Date(parseFloat(data.data.update) * 1000);
        notify(`Result of Get: ${data.result}(${data.desc}) update at <br> ${time}`, data.result);
        data = data.data;
        // console.log(`Last upload time: ${time}`);
        callback(data.value);
    };
    xhr.onerror = (event) => {
        console.log(event);
        notify("Result of Get: Failed, please try it later.");
    };
    xhr.open("GET", url + "/" + key, true);
    xhr.send();
}

function set(url, key, value) {
    const data = JSON.stringify({ key: key, value: value });
    const xhr = new XMLHttpRequest();
    xhr.onload = (event) => {
        // console.log(event);
        const data = JSON.parse(xhr.responseText);
        console.log(data);
        notify(`Result of Set: ${data.result}(${data.desc})`, data.result)
    };
    xhr.onerror = (event) => {
        // console.error(event);
        notify("Result of Set: Failed, please try it later.");
    };
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.send(data);
}

function setValueDomElement(value) {
    let textValue = document.getElementById("value");
    if (textValue !== null) {
        textValue.value = value;
    }
}

function getFromCloud(event) {
    event.preventDefault();
    get(apiUrl(), key(), setValueDomElement);
}

function setToCloud(event) {
    event.preventDefault();
    let textValue = document.getElementById("value");
    const value = textValue.value;
    if (value === null || value === "") {
        notify("Please input content for value.");
        return;
    }
    set(apiUrl(), key(), value);
}

function updateApiLink() {
    let inputBaseUrl = document.getElementById("base-url");
    let baseUrl = inputBaseUrl.value;
    if(baseUrl.endsWith("/")){
        baseUrl = baseUrl.slice(0,-1);
    }
    let link = `${baseUrl}/api/kv`;
    let a = document.createElement('a');
    a.innerText = link;
    a.href = link;
    a.id = "api-url";
    let spanApiLink = document.getElementById("api-link");
    spanApiLink.innerHTML = "";
    spanApiLink.appendChild(a);
}

// Theme relate begin
const getStoredTheme = () => localStorage.getItem('theme')
const setStoredTheme = theme => localStorage.setItem('theme', theme)

const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
        return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
        document.documentElement.setAttribute('data-bs-theme', theme)
    }
}
// Theme relate end

// Generate connect string begin
function getValue(id, defaultValue = null) {
    let input = document.getElementById(id);
    var value = input.value;
    if (!value && !defaultValue) {
        notify(`${input.attributes["placeholder"].textContent} can't be empty!`);
        // console.log()
    }

    return value ?? defaultValue;
}

// mysql+<drivername>://<username>:<urlEncoded(password)>@<server>:<port>/dbname
function generateConnectionString(event) {
    event.preventDefault();
    let dbhost = getValue("dbhost");
    let dbport = getValue("dbport");
    let dbname = getValue("dbname");
    let dbuser = getValue("dbuser");
    let dbpassword = getValue("dbpassword");
    let encodedPassword = encodeURIComponent(dbpassword)

    let provider = "mysql";
    let driver = "pymysql";
    let connectionString = `${provider}+${driver}://${dbuser}:${encodedPassword}@${dbhost}:${dbport}/${dbname}`;
    if (dbhost && dbport && dbname && dbuser && encodedPassword) {
        let input = document.getElementById("connection-string");
        input.value = connectionString;
        input.select();
        document.execCommand("copy");
        notify("Connection String Copied!");
        // const copyContent = async () => {
        //     try {
        //         await navigator.clipboard.writeText(connectionString);
        //         console.log('Content copied to clipboard');
        //     } catch (err) {
        //         console.error('Failed to copy: ', err);
        //     }
        // }
    }
}
// Generate connect string end

// GitHub star count begin
/**
 * Gets the star count for a given Github organization or user and repository.
 * @customfunction
 * @param userName string name of organization or user.
 * @param repoName string name of the repository.
 * @return number of stars.
 */
async function getStarCount(userName, repoName) {

    const url = "https://api.github.com/repos/" + userName + "/" + repoName;

    let xhttp = new XMLHttpRequest();

    return new Promise(function (resolve, reject) {
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState !== 4) return;

            if (xhttp.status == 200) {
                resolve(JSON.parse(xhttp.responseText));
            } else {
                reject({
                    status: xhttp.status,

                    statusText: xhttp.statusText
                });
            }
        };

        xhttp.open("GET", url, true);

        xhttp.send();
    });
}

async function popGithubData(){
    let data = await getStarCount("windsting", "my-kv-store");
    if (!data) return;
    let spanForkCount = document.getElementById("fork-count");
    spanForkCount.textContent = data.forks_count;
    let spanStarCount = document.getElementById("star-count");
    spanStarCount.textContent = data.stargazers_count;
    console.log(data);

}
// GitHub star count end

async function onload() {
    let btnGet = document.getElementById("get");
    btnGet.onclick = getFromCloud;
    let btnSet = document.getElementById("set");
    btnSet.onclick = setToCloud;
    let btnGenerate = document.getElementById("generate-copy")
    btnGenerate.onclick = generateConnectionString;
    let inputBaseUrl = document.getElementById("base-url");
    inputBaseUrl.onchange = updateApiLink;
    updateApiLink();
    popGithubData();

    // let theme = getPreferredTheme();
    // console.log(theme);
    // theme = "dark";
    // setTheme(theme);
}

window.onload = onload;
