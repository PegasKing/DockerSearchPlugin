console.log("Page Load")
var loadInterval;
loadInterval = setInterval(function () {
  addDom();
}, 1000);
let mainId = 'dockerTagSearch';
function addDom() {
  try {
    // 将查询按钮添加到页面上的镜像元素下方
    var tagDom = document.querySelector(".MuiContainer-root .MuiTabs-root");
    if (tagDom == undefined) { 
      return 
    }
    if (document.getElementById(mainId + "mainPanel") != undefined) {
      return
    }
    console.log("Plugin Load")
    var container = document.createElement("container");
    container.className = 'mainPanel'; 
    container.id = mainId + "mainPanel";
    // 创建两个输入框和一个按钮元素
    var imageNameLabel = document.createElement("label");
    imageNameLabel.textContent = "  Image Name:"; 
    var imageNameInput = document.createElement("input");
    imageNameInput.type = "text";
    imageNameInput.value = getImageName();
    imageNameInput.id = mainId+"ImageName";
    imageNameInput.style = "width:30%";
    var imageDigestLabel = document.createElement("label");
    imageDigestLabel.textContent = "  Image DIGEST:";

    var imageDigestInput = document.createElement("input");
    imageDigestInput.type = "text";
    imageDigestInput.id = mainId + "ImageDigest";
    imageDigestInput.style = "width:30%";

    var searchBtn = document.createElement("button");
    searchBtn.textContent = "Search";
    searchBtn.id = "searchBtn";

    var searchResult = document.createElement("span");
    searchResult.textContent = "";
    searchResult.className = "searchResult";
    searchResult.id = mainId + "searchResult";

    var tips = document.createElement("h3");
    tips.textContent = "ImageDigest:use cmd [docker image inspect --format '{{.RepoDigests}}' gitlab/gitlab-ee:latest] get Digest";

    var alink = document.createElement("a");
    alink.href = "https://github.com/PegasKing/DockerSearchPlugin";
    alink.title = "open github project";
    var img = document.createElement("img");
    img.src = "https://img.shields.io/badge/Git-wiki-blue";
    alink.appendChild(img);
    tips.appendChild(alink);

    // 将元素添加到容器中
    container.appendChild(tips);
    container.appendChild(document.createElement("br"));
    container.appendChild(imageNameLabel);
    container.appendChild(imageNameInput); 
    container.appendChild(imageDigestLabel);
    container.appendChild(imageDigestInput); 
    container.appendChild(searchBtn);
    container.appendChild(document.createElement("br"));
    container.appendChild(searchResult);
    tagDom.parentElement.insertBefore(container, tagDom);

    searchBtn.addEventListener("click", function () {
      var searchResult = document.getElementById(mainId+"searchResult");
      searchResult.innerText = 'In Query....';
      try {
        query_result(document.getElementById(mainId + "ImageName").value, document.getElementById(mainId + "ImageDigest").value);
      } catch (e) {
        alert("An error has occurred");
        console.log(e);
        
      }

    });
  } catch (e) {
    console.log("******");
    console.log(e);
    console.log("******");
  }
 
   
}

function getImageName() {
  try {
    var lastBreadcrumb = document.querySelector("#contextNav div div ").lastElementChild.textContent;
    return lastBreadcrumb;
  }
  catch (e) {
    console.log(e);
    return "";
  }
}
function query_result(image_name, hash_code) { 
  if (!hash_code.startsWith('sha256:')) {
    hash_code = 'sha256:' + hash_code;
  }
  if (hash_code.indexOf('@') > -1) {
    var arr = hash_code.split('@');
    hash_code = arr[1];
  }
  var url = 'https://hub.docker.com/v2/repositories/library/' + image_name + '/tags/?page_size=10&page=' + 1;
  get_data(url).then(response=> {
    if (response.count != undefined) {
      url = 'https://hub.docker.com/v2/repositories/library/' + image_name + '/tags/?page_size=100&page=' + 1;
      get_result(url,hash_code)
    }
    else {
      url = 'https://hub.docker.com/v2/repositories/' + image_name + '/tags/?page_size=100&page=' + 1;
      get_result(url,hash_code)
    }
  }).catch(res=> {
      url = 'https://hub.docker.com/v2/repositories/' + image_name + '/tags/?page_size=100&page=' + 1;
      get_result(url, hash_code)
  });
 
}
function get_result(url, hash_code) {
  get_data(url).then(response=> { 
    for (var result of response.results) {
      var digest = '';
      if ('digest' in result) {
        digest = result.digest;
      }
      for (var image of result.images) {
        if (hash_code == digest || hash_code == image.digest) {
          document.getElementById(mainId + "searchResult").innerText = `Result : tag is [${result.name}]` ;
          return;
        }
      }
    }
    if (response.next != undefined) {
      get_result(response.next);
    } else {
      document.getElementById(mainId + "searchResult").innerText = `Result : tag[ not found]`;
    }
  });
}
function get_data(url) {
  return fetch(url)
    .then(response => response.json())
    .then(obj => obj);
}