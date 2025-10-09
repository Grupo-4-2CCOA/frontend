import React, { useState } from "react";
import styles from "../styles/system-filters.module.css";
import BotaoPrincipal from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from 'react-router-dom';

export default function SystemFilters() {
    const [periodo, setPeriodo] = useState("Semanal");
    const navigate = useNavigate();

    const handleChange = (event) => {
      setPeriodo(event.target.value);
    };  

    const handleNavigate = (route) => {
        navigate(route);
    };

    return (
        <div className={styles.filtersContainer}>
            <div>
                <FormControl fullWidth sx={{
                    width: 300,
                    "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                            borderColor: "var(--DOURADO)",
                            color: "var(--DOURADO)"
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "var(--ROSA-LOGO)",
                            borderWidth: "3px",
                            color: "var(--ROSA-LOGO)"
                        },
                    },
                    "& .MuiInputLabel-root": {
                        "&:hover": {
                            borderColor: "var(--DOURADO)",
                            color: "var(--DOURADO)"
                        },
                        "&.Mui-focused": {
                            borderColor: "var(--ROSA-LOGO)",
                            color: "var(--ROSA-LOGO)"
                        }
                    }
                }}>
                    <InputLabel id="demo-simple-select-label">Período</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={periodo}
                        label="Aql"
                        onChange={handleChange}
                    >
                        <MenuItem value={"Semanal"}>Semanal</MenuItem>
                        <MenuItem value={"Mensal"}>Mensal</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <span>Vendas</span>
            <div className={styles.buttons}>
                <BotaoSecundario onClick={() => handleNavigate("/system-dashboard")} children="Serviços" />
                <BotaoPrincipal onClick={() => handleNavigate("/sells-dashboard")} children="Funil de Vendas" />
            </div>
        </div>
    );
}
