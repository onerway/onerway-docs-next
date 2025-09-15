import{K as n}from"#entry";function r(r,t,e){const o=r.findIndex(r=>n(r,t)),f=r.findIndex(r=>n(r,e));if(-1===o||-1===f)return[];const[i,s]=[o,f].sort((n,r)=>n-r);return r.slice(i,s+1)}export{r as f};
