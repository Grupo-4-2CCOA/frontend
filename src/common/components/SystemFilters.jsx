import React from "react";
import styles from "../styles/system-filters.module.css";
import BotaoPrincipal from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { createTheme } from "@mui/material/styles";

export default function SystemFilters() {
    const theme = createTheme({ 
        palette: {
            primary: {
                light: '#757ce8',
                main: '#3f50b5',
                dark: '#002884',
                contrastText: '#fff',
            }
        },
    });

    return (
        <div className={styles.filtersContainer}>
            {/* <select defaultValue="mensal">
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
            </select> */}
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
                        value={"Semanal"}
                        label="Aql"
                    >
                        <MenuItem value={"Semanal"}>Semanal</MenuItem>
                        <MenuItem value={"Mensal"}>Mensal</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <span>Serviços</span>
            <div className={styles.buttons}>
                <BotaoPrincipal children="Serviços" />
                <BotaoSecundario children="Funil de Vendas" />
            </div>
        </div>
    );
}
