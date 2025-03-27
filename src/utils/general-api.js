const REACT_APP_URL_API="https://www.sikarlia.com/api";

export async function getDashboardInfo (yearInput, username) {
    const ro1 = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: username, year:yearInput })
      };
      await fetch(REACT_APP_URL_API+'/rest/getDashboardInfo.php', ro1)
          .then(response => response.json())
          .then(respon => {
            var dataAPI = respon;
            
            if(dataAPI.response_code != 200){
              
            }else{
              localStorage.setItem("dataDashboard", JSON.stringify(dataAPI.data));
              //console.log("pdtKoordinator");
              console.log(dataAPI.data);
  
              //this.setState({ pdtKoordinator : dataAPI});
            }
          });
}

export async function getPenandatangan (yearInput, kategori) {
    const ro1 = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: kategori, year:yearInput })
      };
      await fetch(REACT_APP_URL_API+'/rest/lookupPdt.php', ro1)
          .then(response => response.json())
          .then(respon => {
            var dataAPI = respon;
            
            if(dataAPI.response_code != 200){
              
            }else{
              localStorage.setItem("pdt"+kategori, JSON.stringify(dataAPI.data));
            }
          });
}