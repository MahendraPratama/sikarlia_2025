export const setSession = (dataSession) => {
    localStorage.setItem("user_session", dataSession.userid);
    localStorage.setItem("user_name", dataSession.name);
    localStorage.setItem("user_type", dataSession.user_type);
    localStorage.setItem("id", dataSession.id);
    localStorage.setItem("password", dataSession.password);
    localStorage.setItem("email", dataSession.email);
    var newDate = new Date();
    localStorage.setItem("yearFilter", newDate.getFullYear());

    var now = newDate.getTime();
    
    localStorage.setItem('setupTime', now);
}