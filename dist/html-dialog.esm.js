var n=function(n){var o=n.title,t=n.content,e=n.buttons,c=n.classNames,a=void 0===c?{dialog:"",title:"",content:"",buttons:""}:c;if(!o||!t||!e)throw new Error("Missing parameters");var i,r,u='\n    <form method="dialog">\n        <div class="'.concat(a.title,'">').concat(o,'</div>\n        <div class="').concat(a.content,'">').concat(t,'</div>\n        <div class="').concat(a.buttons,'">\n        ').concat(e.map((function(n){var o,t;return'<button type="'.concat(null!==(o=null==n?void 0:n.type)&&void 0!==o?o:"button",'" class="').concat(null!==(t=n.classNames)&&void 0!==t?t:"",'">').concat(n.text,"</button>")})).join(""),"\n        </div>\n    </form>\n    "),l=["onclick","oncontextmenu","ondblclick","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup"];return{create:function(){var n,o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{appendTo:null},t=document.createElement("dialog");return t.id="html-dialog-"+Math.random().toString(36).substr(2,9),t.className=null!==(n=a.dialog)&&void 0!==n?n:"",t.innerHTML=u,o.appendTo?o.appendTo.appendChild(t):document.body.appendChild(t),i=document.querySelector("#".concat(t.id)),e.forEach((function(n,o){var t=i.querySelector("button:nth-child(".concat(o+1,")"));Object.keys(n).forEach((function(o){if(l.includes(o)){var e=o.replace("on","");t.addEventListener(e,(function(t){n[o].call(i,t)}))}}))})),(r=t.querySelector("form")).addEventListener("submit",(function(n){n.preventDefault()})),this},open:function(){return i.showModal(),this},close:function(){return i.close(),this},destroy:function(){document.body.removeChild(i)},getDialog:function(){return i},getForm:function(){return r}}};export{n as Dialog};
