import React from "react";
import Navbar from "../common/components/Navbar";
import Footer from "../common/components/Footer";
import { getCadastroComponent } from "../common/components/cadastro";

const Cadastro = getCadastroComponent();

export default function CadastroPage() {
  return (
    <>
      <Navbar />
      <Cadastro />
    </>
      );
}