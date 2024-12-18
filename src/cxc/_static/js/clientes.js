var cliente =
{
    tableId: "", table: null,

    init()
    {
        if (this.tableId.trim() != "") { this.table = document.getElementById(this.tableId); }
    },

    trigger(element,event) {
        if (element) {
            if (element.nodeName==="FORM" && event=='submit') {
                element.requestSubmit();
                return
            }
            let e = new Event(event);
            element.dispatchEvent(e);
        }
    },

    goTo(url)
    {
        if (!url) { alert("No se ha indicado un destino."); return; }
        if (!this.table) { alert("No se encontro una definición de tabla (edit-table)."); return; }
        if (this.table.CurrentRowIndex() < 0) { alert("Debe seleccionar una fila"); return; }

        var data = this.table.DataArray[this.table.CurrentRowIndex()];
        window.location.href = url.replace("{_cliente}",data.sys_pk);
    },

    getCurrentContext()
    {
        const id = (this.table?.DataArray[this.table.CurrentRowIndex()]?.sys_pk ?? "");
        return { item_id:id, context: {} }
    },

    list: {
        tbl_clientes: null,
        tEvents: {},
        tData: {},
        txt_search_cliente: null,
        btn_search_cliente: null,

        init()
        {
            this.txt_search_cliente = document.getElementById("txt_search_cliente");
            this.btn_search_cliente = document.getElementById("btn_search_cliente");
            this.tbl_clientes = document.getElementById("tbl_clientes");

            if (this.txt_search_cliente) {
                this.txt_search_cliente.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") this.buscarCliente();
                });
            }
            if (this.btn_search_cliente) {
                this.btn_search_cliente.addEventListener("click", () => { this.buscarCliente(); });
            }

            this.setEvents();
            this.setKeyboardShortcuts();
        },

        setEvents()
        {
            if (this.tbl_clientes)
            {
                this.tbl_clientes.hiddeSelector = true;
                this.tbl_clientes.AutoAddRow = false;
                this.tbl_clientes.AutoDelRow = false;

                this.tEvents = this.tbl_clientes.EdiTable.Const.Events;
                // this.tData = this.tbl_clientes.DataArray;

                this.tbl_clientes.Events[this.tEvents.EnterCell] = (e) => {
                    let tr = e.td.offsetParent;
                    // let currRow = e.sender.CurrentRowIndex();
                    // let currCol = e.sender.CurrentColIndex();
                    // let dtPdr = this.tData[currRow];

                    tr.ondblclick = (event) => { cliente.goTo("/!/cxc/clientes/{_cliente}/"); }
                };

                this.tbl_clientes.Events[this.tEvents.RowChanged] = (e) => {
                    let obj = (this.tbl_clientes?.DataArray??[])[e.index];
                    v12navbar.toggleButtonInteraction(!obj);
                }

                v12navbar.toggleButtonInteraction(true);
            }
        },

        setKeyboardShortcuts()
        {
            document.addEventListener("keydown", (e) => {
                // console.log("key: "+ e.key + " | " + "code: " + e.code);
                if (e.key === "Escape") {
                    e.preventDefault();
                    window.open("/","_top");
                }
            });
        },

        buscarCliente() {
            let text = this.txt_search_cliente.value.trim();
            let url = this.txt_search_cliente.getAttribute("data-url-search").trim();
            if (!text) return;
            if (!url) { alert("No se indico un destino"); return; }
            if (!this.tbl_clientes) { alert("No se ha definido la tabla de clientes."); return; }
            url = url.replace("@search",text);
            
            let onSuccess = (data) => {
                if (data.message) { alert(data.message); return; }
                let div_spnmsg = document.getElementById("div_spnmsg");

                if (Object.entries(data).length == 0) {
                    div_spnmsg.querySelector("#spnmsg").textContent = "No se encontraron resultados.";
                    div_spnmsg.classList.remove("d-none");
                } else {
                    div_spnmsg.querySelector("#spnmsg").textContent = "";
                    div_spnmsg.classList.add("d-none");
                }
                
                this.tData = data;
                this.tbl_clientes.DataArray = data;
                this.tbl_clientes._printRows();
            }
            let onFailure = (error) => {
                alert('No se pudo realizar la busqueda.\n' + JSON.stringify(error));
            }
    
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false);
        }
    },

    form: {
        formCliente: null,
        elements: null,
        btnSave: null,
        dtCliente: {},
        domicilio1: {},
        domicilio2: {},
        domicilio3: {},

        url_buscar_edoprov: "",
        url_buscar_ciudad: "",
        url_buscar_contacto: "",
        ipais: 0, iestado: 0, iciudad: 0,
        CXC_CLIENTES: "", CTE_AGREGAR: "",
        dataForm:null,
        init()
        {
            this.formCliente = document.getElementById("form_cliente");
            this.btnSave = document.getElementById("btn_save");
            this.btn_reload_regimens=document.getElementById("reload_regimens");
            this.setEvents();
            this.setKeyboardShortcuts();
        },
        ValidateForm(event)
        {
            if(!event)return true;
            
            event.stopPropagation();
            event.preventDefault();

            var form=event.target;
      
            if(!form)return true;

            if(!form.reportValidity())return false;
            if(!form.checkValidity())return false;

            var fields_number=form.querySelectorAll(".validate-number");
            
            var break_for=false;
            for (let i = 0; i < fields_number.length; i++) 
            {
                const field = fields_number[i];
                if(field && field.hasAttribute("required"))
                {
                    var data_value=field.getAttribute("data-value") ?? field.value;
                    var value=field.getAttribute("value");
                    var alert_text=field.getAttribute("alert");
                    if(data_value.trim()!="")value=data_value;

                    if(Number(value)<1)
                    {
                        var msg=field.message??"El campo "+field.name+" debe ser mayor a 0";
                        break_for=true;
                        field.focus();
                        if(alert_text=="true")
                        {
                            alert(msg);
                        }
                    }
                }
                if(break_for)break;
            }
            if(break_for)return false;

            return true;
        },
        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formCliente) {
                this.elements = this.formCliente.elements;

                //#region domicilio 1 (domicilio_fiscal)
                this.elements["chq_domicilio1"].addEventListener("change", (event) => {
                    let domicilio1 = document.getElementById("cbody_domicilio1");
                    (event.target.checked) ? domicilio1.classList.remove("disable-form") : domicilio1.classList.add("disable-form");

                    if (this._GET["_entity_id"] == "_new" || Object.entries(this.domicilio1).length == 0) { this.elements["sel_pais"].value = this.ipais; }
                    else { this.elements["sel_pais"].value = this.domicilio1.ipais; }

                    if (this.elements["sel_estado"].options.length <= 0) this.fillEstados(this.elements["sel_pais"],this.elements["sel_estado"]);
                });
                this.elements["sel_pais"].addEventListener("change", () => {
                    this.fillEstados(this.elements["sel_pais"],this.elements["sel_estado"]);
                });
                this.elements["sel_estado"].addEventListener("change", () => {
                    this.fillCiudades(this.elements["sel_estado"],this.elements["sel_ciudad"]);
                });
                //#endregion

                //#region domicilio 2 (alterno)
                this.elements["chq_domicilio2"].addEventListener("change", (event) => {
                    let domicilio2 = document.getElementById("cbody_domicilio2");
                    (event.target.checked) ? domicilio2.classList.remove("disable-form") : domicilio2.classList.add("disable-form");

                    if (this._GET["_entity_id"] == "_new" || Object.entries(this.domicilio2).length == 0) { this.elements["sel_pais2"].value = this.ipais; }
                    else { this.elements["sel_pais2"].value = this.domicilio2.ipais; }

                    if (this.elements["sel_estado2"].options.length <= 0) this.fillEstados(this.elements["sel_pais2"],this.elements["sel_estado2"]);
                });
                this.elements["sel_pais2"].addEventListener("change", () => {
                    this.fillEstados(this.elements["sel_pais2"],this.elements["sel_estado2"]);
                });
                this.elements["sel_estado2"].addEventListener("change", () => {
                    this.fillCiudades(this.elements["sel_estado2"],this.elements["sel_ciudad2"]);
                });
                //#endregion

                //#region domicilio 3 (alterno)
                this.elements["chq_domicilio3"].addEventListener("change", (event) => {
                    let domicilio3 = document.getElementById("cbody_domicilio3");
                    (event.target.checked) ? domicilio3.classList.remove("disable-form") : domicilio3.classList.add("disable-form");

                    if (this._GET["_entity_id"] == "_new" || Object.entries(this.domicilio3).length === 0) { this.elements["sel_pais3"].value = this.ipais; }
                    else { this.elements["sel_pais3"].value = this.domicilio3.ipais; }

                    if (this.elements["sel_estado3"].options.length <= 0) this.fillEstados(this.elements["sel_pais3"],this.elements["sel_estado3"]);
                });
                this.elements["sel_pais3"].addEventListener("change", () => {
                    this.fillEstados(this.elements["sel_pais3"],this.elements["sel_estado3"]);
                });
                this.elements["sel_estado3"].addEventListener("change", () => {
                    this.fillCiudades(this.elements["sel_estado3"],this.elements["sel_ciudad3"]);
                });
                //#endregion
                
                this.elements["chq_otorgar_credito"].addEventListener("change", (event) => {
                    let div_credito = document.getElementById("div_otorgar_credito");
                    (event.target.checked) ? div_credito.classList.remove("disable-form") : div_credito.classList.add("disable-form");
                });
                this.elements["rd_credito_ilimitado"].addEventListener("change", (event) => {
                    this.elements["limitecredito"].type = "hidden";
                    this.elements["limitecredito"].value = 0;
                });
                this.elements["rd_credito_limitado"].addEventListener("change", (event) => {
                    this.elements["limitecredito"].type = "number";
                });

                if (this._GET["_entity_id"] != "new")
                {
                    cliente.trigger(this.elements["chq_domicilio1"],"change");

                    let contacto1 = Number(this.dtCliente.contacto1);
                    let contacto2 = Number(this.dtCliente.contacto2);
                    let contacto3 = Number(this.dtCliente.contacto3);

                    if (contacto1 > 0) {
                        let ikContacto1 = document.getElementById("ik_contacto1");
                        this.setContacto(ikContacto1,contacto1);
                    }
                    if (contacto2 > 0) {
                        let ikContacto2 = document.getElementById("ik_contacto2");
                        this.setContacto(ikContacto2,contacto2);
                    }
                    if (contacto3 > 0) {
                        let ikContacto3 = document.getElementById("ik_contacto3");
                        this.setContacto(ikContacto3,contacto3);
                    }

                    cliente.trigger(this.elements["chq_domicilio2"],"change");
                    cliente.trigger(this.elements["chq_domicilio3"],"change");
                }
                this.elements["txt_rfc"].addEventListener("change",()=>
                {
                    this.FilterRegimenFiscal();
                }); 
                this.elements["txt_rfc"].addEventListener("blur",()=>
                {
                    this.FilterRegimenFiscal();
                });
                this.FilterRegimenFiscal();
                if(this.btn_reload_regimens)this.btn_reload_regimens.addEventListener("click",()=>{this.FilterRegimenFiscal();});
            }
        },

        setKeyboardShortcuts()
        {
            document.addEventListener("keydown", (e) => {
                // console.log("key: "+ e.key + " | " + "code: " + e.code);
                if (e.key === "Escape") {
                    // Salir
                    e.preventDefault();
                    window.location.href = this.CXC_CLIENTES;
                }
                if (e.key === "F2") {
                    // Agregar nuevo
                    e.preventDefault();
                    if (this._GET["_entity_id"] != "_new") window.location.href = this.CTE_AGREGAR;
                }
                if (e.key === "F6") {
                    // Guardar
                    e.preventDefault();
                    this.elements["shortcut"].value = "F6";
                    this.saveForm();
                }
                if (e.key === "F8") {
                    // Guardar y salir
                    e.preventDefault();
                    this.elements["shortcut"].value = "F8";
                    this.saveForm();
                }
                if (e.key === "F9") {
                    // Guardar y nuevo
                    e.preventDefault();
                    this.elements["shortcut"].value = "F9";
                    this.saveForm();
                }
            });
        },

        fillEstados(ref,out){
            let url = this.url_buscar_edoprov.replace("search","ipais");
            url = InduxsoftCrudlModel.UrlReplace(url,{ipais:ref.value});
            let selected = this.iestado;
            if (this._GET["_entity_id"] != "_new")
            {
                if (out.id == "sel_estado" && Object.entries(this.domicilio1).length > 0) selected = this.domicilio1.iestado;
                else if (out.id == "sel_estado2" && Object.entries(this.domicilio2).length > 0) selected = this.domicilio2.iestado;
                else if (out.id == "sel_estado3" && Object.entries(this.domicilio3).length > 0) selected = this.domicilio3.iestado;
            }

            let onSuccess = (data) => {
                if (data.message) {
                    console.error(data.message);
                    return;
                }

                out.innerHTML = "";
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.sys_pk;
                    option.text = item.text;
                    if (item.sys_pk == selected) option.selected = true;

                    out.appendChild(option);
                });
                cliente.trigger(out,"change");
            }
            let onFailure = (error) => { console.error(error) }
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false,false);
        },
        FilterRegimenFiscal()
        {
            var txt_rfc=this.elements["txt_rfc"];
            if(!txt_rfc) return;

            var select_regimen=this.elements["regfiscal"];
            if(!select_regimen)return;
            
            var html="";

            if(txt_rfc.value.trim()==""){select_regimen.innerHTML=html;return;}
            
            for (let i = 0; i < this.regimenes.length; i++) 
            {
                const regimen = this.regimenes[i];
                var options=false;
                
                if(txt_rfc.value.trim().length<13 && (regimen.moral??"").toLowerCase().includes("s")){options=true;}
                else if(txt_rfc.value.trim().length>12 && (regimen.fisica??"").toLowerCase().includes("s")){options=true;}

                if(options)html+=`<option value="${regimen.clave}" ${regimen.clave==this.regimen_selected?"selected":""}="true">${regimen.clave+" - "+regimen.valor}</option>`;;
            }
            select_regimen.innerHTML=html;
        },
        fillCiudades(ref,out){
            let url = this.url_buscar_ciudad.replace("search","iestado");
            url = InduxsoftCrudlModel.UrlReplace(url,{iestado:ref.value});
            let selected = this.iciudad;
            if (this._GET["_entity_id"] != "new")
            {
                if (out.id == "sel_ciudad" && Object.entries(this.domicilio1).length > 0) selected = this.domicilio1.iciudad;
                else if (out.id == "sel_ciudad2" && Object.entries(this.domicilio2).length > 0) selected = this.domicilio2.iciudad;
                else if (out.id == "sel_ciudad3" && Object.entries(this.domicilio3).length > 0) selected = this.domicilio3.iciudad;
            }

            let onSuccess = (data) => {
                if (data.message) {
                    console.error(data.message);
                    return;
                }

                out.innerHTML = "";
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.sys_pk;
                    option.text = item.text;
                    if (item.sys_pk == selected) option.selected = true;

                    out.appendChild(option);
                });
            }
            let onFailure = (error) => { console.error(error) }
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false,false);
        },

        setContacto(ik,icontacto){
            let url = this.url_buscar_contacto.replace("search","id");
            url = InduxsoftCrudlModel.UrlReplace(url,{id:icontacto})

            let onSuccess = (data) => {
                if (data.message) { alert(data.message); return; }
                ik.setValue(data);
            }
            let onFailure = (error) => { console.error(error) }
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false,false);
        },

        saveForm(){
            if (!this.formCliente.reportValidity()) return;
            this.formCliente.submit();
        },
    },

    cobro: {
        formCobro: null,
        elements: null,
        btnSave: null,
        dtCliente: {},
        dvsPred: {},
        decimals: 2,

        init()
        {
            this.formCobro = document.getElementById("form_cobro");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { cliente.trigger(this.formCobro,"submit") }); }
            if (this.formCobro) {
                this.elements = this.formCobro.elements;

                this.elements["sel_cuenta_deposito"].addEventListener("change", (event) => {
                    let option = event.target.options[event.target.selectedIndex];
                    let codigo = option.getAttribute("data-divisa").toUpperCase();
                    let cambio = Number(option.getAttribute("data-tcambio"));

                    this.pedirTCambio();

                    this.elements["txt_tcambio_deposito"].value = Math.RoundTo(cambio, this.decimals);
                    cliente.trigger(this.elements["txt_tcambio_deposito"],"change");
                });
                
                this.elements["txt_tcambio_deposito"].addEventListener("change", (event) => {
                    let tcambio_dep = Number(event.target.value);
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    
                    let importe_cte = Number(this.elements["txt_importe"].value);
                    let importe_dep = Math.mul(importe_cte,tcambio_cte);
                    importe_dep = Math.div(importe_dep,tcambio_dep);
                    
                    this.elements["txt_importe_deposito"].value = Math.RoundTo(importe_dep, this.decimals);
                });
                this.elements["txt_importe_deposito"].addEventListener("change", (event) => {
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    let tcambio_dep = Number(this.elements["txt_tcambio_deposito"].value);
                    
                    let importe_dep = Number(event.target.value);
                    let importe_cte = Math.mul(importe_dep,tcambio_dep);
                    importe_cte = Math.div(importe_cte,tcambio_cte);

                    this.elements["txt_importe"].value = Math.RoundTo(importe_cte, this.decimals);
                });

                this.elements["txt_importe"].addEventListener("change", (event) => {
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    let tcambio_dep = Number(this.elements["txt_tcambio_deposito"].value);
                    
                    let importe_cte = Number(event.target.value);
                    let importe_dep = Math.mul(importe_cte,tcambio_cte);
                    importe_dep = Math.div(importe_dep,tcambio_dep);

                    this.elements["txt_importe_deposito"].value = Math.RoundTo(importe_dep, this.decimals);
                });
            }
        },

        pedirTCambio(){
            let optCtaR = this.elements["sel_cuenta_deposito"].options[this.elements["sel_cuenta_deposito"].selectedIndex];
            let cDvsPred = (this.dvsPred.codigo).toUpperCase();
            let cDvsProv = (this.dtCliente.divisa).toUpperCase();
            let cDvsCtaR = optCtaR.getAttribute("data-divisa").toUpperCase();

            let hide_tcambio_dep = false;
            let hide_importe_dep = false;
            let hide_tcambio_cte = false;

            let div_tcambio_cte = document.getElementById("div_tcambio");
            let txt_tcambio_cte = document.getElementById("txt_tcambio");
            let txt_importe_cte = document.getElementById("txt_importe");

            let div_tcambio_dep = document.getElementById("div_tcambio_deposito");
            let div_importe_dep = document.getElementById("div_importe_deposito");
            let txt_tcambio_dep = document.getElementById("txt_tcambio_deposito");
            let spn_tcambio_dep = document.getElementById("spn_tcambio_deposito");
            let txt_importe_dep = document.getElementById("txt_importe_deposito");
            let spn_importe_dep = document.getElementById("spn_importe_deposito");

            if (cDvsPred == cDvsProv && cDvsPred == cDvsCtaR)
            {
                txt_tcambio_cte.value = 1;
                txt_tcambio_dep.value = 1;

                hide_tcambio_cte = true;
                hide_tcambio_dep = true;
                hide_importe_dep = true;
            }
            else if (cDvsPred != cDvsProv && cDvsProv == cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;

                hide_tcambio_dep = true;
                hide_importe_dep = true;
            }
            else if (cDvsPred == cDvsProv && cDvsPred != cDvsCtaR)
            {
                let tcambio_dep = Number(txt_tcambio_dep.value);

                txt_tcambio_cte.value = 1;
                txt_tcambio_dep.value = (tcambio_dep <= 0) ? Number(optCtaR.getAttribute("data-tcambio")) : tcambio_dep;
                
                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;

                hide_tcambio_cte = true;
            }
            else if (cDvsPred != cDvsProv && cDvsPred == cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = 1;

                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;

                hide_tcambio_dep = true;
            }
            else if (cDvsPred != cDvsProv && cDvsPred != cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);
                let tcambio_dep = Number(txt_tcambio_dep.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = (tcambio_dep <= 0) ? Number(optCtaR.getAttribute("data-tcambio")) : tcambio_dep;
                
                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;
            }

            txt_importe_cte.value = Number(txt_importe_cte.value);
            txt_importe_dep.value = Number(txt_importe_dep.value);

            div_tcambio_dep.classList.toggle("d-none",hide_tcambio_dep);
            div_importe_dep.classList.toggle("d-none",hide_importe_dep);
            div_tcambio_cte.classList.toggle("d-none",hide_tcambio_cte);
        },
    },

    bonificacion: {
        formBonificacion: null,
        elements: null,
        btnSave: null,
        decimals: 2,

        init()
        {
            this.formBonificacion = document.getElementById("form_bonificacion");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { cliente.trigger(this.formBonificacion,"submit") }); }
            if (this.formBonificacion) { this.elements = this.formBonificacion.elements; }
        },
    },
    precioventa:
    {
        init()
        {
            this.tbl_precioventa=document.getElementById("tbl_precioventa");
            this.ik_producto = document.getElementById("ik_producto");
            this.btn_guardar=document.getElementById("btn_guardar");
            this.form_precioventa=document.getElementById("form_precioventa");
            this.data_array=document.getElementById("data_array");

            if(this.btn_guardar)this.btn_guardar.addEventListener("click",()=>{cliente.precioventa.validatePrecioventa();});
            this.setEventTable();
        },
        setEventTable()
        {
            if(!this.tbl_precioventa ||!this.ik_producto)return;

            this.ik_producto.change_event = (data) => this.IncludeProd(data);
            
            this.tbl_precioventa.setInputKey("codigo",this.ik_producto);
            this.tbl_precioventa.setInputKey("descripcion",this.ik_producto);
        },
        IncludeProd(data)
        {
            let dtarray = this.tbl_precioventa?.DataArray ?? [];
            let _productos = this.filterData();
            let available_row = (_productos.length > 0) ? _productos.length : 0;
            
            data["precio"]=0;
            data["limite"]=1;

            dtarray[available_row] = data;

            this.tbl_precioventa._printRows();
            this.tbl_precioventa.NavTo(available_row,2);
        },
        filterData() 
        {
            return (this.tbl_precioventa?.DataArray??[]).filter((row) => { return Object.keys(row??{}).length >= this.tbl_precioventa.Columns.length });
        },
        deleteRow()
        {
            var row=this.tbl_precioventa?.DataArray[this.tbl_precioventa?.CurrentRowIndex()];
            if(!row || Object.keys(row).length< 1)
            {
                alert("Debe seleccionar un elemento de la tabla");
                return;
            }
            this.tbl_precioventa.DeleteCurrentRow();
        },
        addRow()
        {
            this.tbl_precioventa.AddRow();
        },
        validatePrecioventa()
        {
            var array=(this.tbl_precioventa?.DataArray??[]);
            var sinprecio=false;
            var l=[];
            for (let i = 0; i < array.length; i++) 
            {
                const row = array[i];
                if(Object.keys(row).length > 0)
                {
                    if((row.precio??0)<1)sinprecio=true;
                    l.push(row);
                }
            }
            if(this.data_array)this.data_array.value=JSON.stringify(l);
            
            if(sinprecio)
            {
               var res= confirm("Existen productos sin asignar un precio ¿Esta seguro de guardar la lista?");
               if(!res)return;
               
               InduxsoftCrudlModel.Submit("form_precioventa");
            }
            else
            {
                InduxsoftCrudlModel.Submit("form_precioventa");
            }
        }
    }
}