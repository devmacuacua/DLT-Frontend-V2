import React, { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Space,
  Typography,
  Image,
} from "antd";
import { query } from "@app/utils/users";
import { queryAll } from "@app/utils/province";
import { queryDistrictsByProvinces } from "@app/utils/locality";
import moment from "moment";
import dreams from "../../../assets/dreams.png";

import {
  getNewlyEnrolledAgywAndServices,
  // getNewlyEnrolledAgywAndServicesSummary,
} from "@app/utils/report";
import { Title as AppTitle } from "@app/components";
import LoadingModal from "@app/components/modal/LoadingModal";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const { Option } = Select;
const { Title } = Typography;
const created = moment().format("YYYYMMDD_hhmmss");

const DataExtraction = () => {
  const [loggedUser, setLogguedUser] = useState<any>(undefined);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any>(undefined);
  const [selectedDistricts, setSelectedDistricts] = useState<any[]>([]);
  const [initialDate, setInitialDate] = useState<any>();
  const [finalDate, setFinalDate] = useState<any>();
  const [form] = Form.useForm();
  const [dataLoading, setDataLoading] = useState(false);
  const [lastPage, setLastPage] = useState<number>(0);
  const [lastPageSummary, setLastPageSummary] = useState<number>(0);
  const [extraOption, setExtraOption] = useState(0);
  const RequiredFieldMessage = "Obrigatório!";
  const pageSize = 1000;
  const [data, setData] = useState<any>();
  const fileRef = useRef();

  const districtsIds = selectedDistricts.map((district) => {
    return district.id;
  });

  const extraOptions = [
    { id: 1, name: "Novas RAMJ, Vulnerabilidades e Serviços" },
    {
      id: 2,
      name: "Sumário de Novas RAMJ, Vulnerabilidades e Serviços",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const loggedUser = await query(localStorage.user);
      let provinces;
      if (loggedUser.provinces.length > 0) {
        provinces = loggedUser.provinces;
      } else {
        provinces = await queryAll();
      }
      setLogguedUser(loggedUser);
      setProvinces(provinces);
    };

    fetchData().catch((error) => console.log(error));
  }, []);

  const onChangeProvinces = async (values: any) => {
    if (values.length > 0) {
      const provs = provinces.filter((item) =>
        values.includes(item.id.toString())
      );
      setSelectedProvinces(provs);
      let dataDistricts;
      if (loggedUser.districts.length > 0) {
        dataDistricts = loggedUser.districts.filter((d) =>
          values.includes(d.province.id.toString())
        );
      } else {
        dataDistricts = await queryDistrictsByProvinces({
          provinces: Array.isArray(values) ? values : [values],
        });
      }
      setDistricts(dataDistricts);
    } else {
      setDistricts(undefined);
    }

    form.setFieldsValue({ districts: [] });
  };

  const onChangeDistricts = async (values: any) => {
    if (values.length > 0) {
      const distrs = districts.filter((item) =>
        values.includes(item.id.toString())
      );
      setSelectedDistricts(distrs);
    }
  };

  // const handleGenerateXLSXReport = () => {
  //   if (
  //     selectedProvinces.length < 1 ||
  //     selectedDistricts.length < 1 ||
  //     initialDate === undefined ||
  //     finalDate === undefined
  //   ) {
  //     toast.error("Por favor selecione os filtros para relatorio");
  //   } else {
  //     setDataLoading(true);
  //     if (extraOption == 1) {
  //       // downloadJsonReport();
  //       generateXlsReport();
  //     } else if (extraOption == 2) {
  //       generateSummaryXlsReport();
  //     } else {
  //       setDataLoading(false);
  //       toast.error("Por favor selecione o tipo de extração");
  //     }
  //   }
  // };

  const downloadJsonReport = async () => {
    if (
      selectedProvinces.length < 1 ||
      selectedDistricts.length < 1 ||
      initialDate === undefined ||
      finalDate === undefined
    ) {
      toast.error("Por favor selecione os filtros para relatorio");
    } else {
      try {
        setDataLoading(true);
        const response = await getNewlyEnrolledAgywAndServices(
          districtsIds,
          initialDate,
          finalDate
        );

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DLT2.0_SUMARIO_NOVAS_RAMJ_ VULNERABILIDADES_E_SERVICOS_${created}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        setDataLoading(false);
      } catch (error) {
        console.error("Error downloading the Excel report", error);
      }
    }
  };

  const generateXlsReport = async () => {
    console.log("On Export XLS");

    try {
      setDataLoading(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        "DLT2.0_NOVAS_RAMJ_ VULNERABILIDADES_E_SERVICOS"
      );

      worksheet.mergeCells("A1:AN1");

      worksheet.mergeCells("A6:Q6");
      worksheet.mergeCells("R6:AD6");
      worksheet.mergeCells("AE6:AN6");

      worksheet.getCell("A1").value = "Novas RAMJ, Vulnerabilidades e Serviços";

      worksheet.getCell("A3").value = "Data de Início";
      worksheet.getCell("A4").value = "Data de Fim";
      worksheet.getCell("B3").value = moment(initialDate).format("YYYY-MM-DD");
      worksheet.getCell("B4").value = moment(finalDate).format("YYYY-MM-DD");
      worksheet.getCell("A6").value = "Informação Demográfica ";
      worksheet.getCell("S6").value = "Vulnerabilidades ";
      worksheet.getCell("AE6").value = "Serviços e Sub-Serviços ";

      worksheet.getCell("A1").font = {
        family: 4,
        size: 11,
        underline: true,
        bold: true,
      };
      worksheet.getCell("A3").font = {
        family: 4,
        size: 11,
        underline: true,
        bold: true,
      };
      worksheet.getCell("A4").font = {
        family: 4,
        size: 11,
        underline: true,
        bold: true,
      };
      worksheet.getCell("A6").alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet.getCell("S6").alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet.getCell("AE6").alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      const headers = [
        "#",
        "Província",
        "Distrito",
        "Onde Mora",
        "Ponto de Entrada",
        "Organização",
        "Data de Registo",
        "Registado Por",
        "Data da Última Actualização",
        "Actualizado Por",
        "NUI",
        "Sexo",
        "Idade (Registo)",
        "Idade (Actual)",
        "Faixa Etária (Registo)",
        "Faixa Etária (Actual)",
        "Data de Nascimento",
        "Beneficiaria DREAMS ?",
        "Com quem Mora",
        "Sustenta a Casa",
        "É Orfã",
        "Vai à escola",
        "Tem Deficiência",
        "Tipo de Deficiência",
        "Já foi casada",
        "Já esteve grávida",
        "Tem filhos",
        "Está Grávida ou a Amamentar",
        "Trabalha",
        "Já fez teste de HIV",
        "Área de Serviço",
        "Serviço",
        "Sub-Serviço",
        "Pacote de Serviço",
        "Ponto de Entrada de Serviço",
        "Localização do Serviço",
        "Data do Serviço",
        "Provedor do Serviço",
        "Outras Observações",
        "Status",
      ];

      const headerRow = worksheet.getRow(7);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.value = header;
        cell.font = { bold: true };
      });

      let sequence = 1;

      data.forEach((report) => {
        const values = [
          sequence,
          report.provincia,
          report.distrito,
          report.onde_mora,
          report.ponto_entrada,
          report.organizacao,
          report.data_registo,
          report.registado_por,
          report.data_actualizacao,
          report.actualizado_por,
          report.nui,
          report.sexo,
          report.idade_registo,
          report.idade_actual,
          report.faixa_registo,
          report.faixa_actual,
          report.data_nascimento,
          report.agyw_prev,
          report.com_quem_mora,
          report.sustenta_casa,
          report.e_orfa,
          report.vai_escola,
          report.tem_deficiencia,
          report.tipo_deficiencia,
          report.foi_casada,
          report.esteve_gravida,
          report.tem_filhos,
          report.gravida_amamentar,
          report.teste_hiv,
          report.area_servico,
          report.a_servico,
          report.sub_servico,
          report.pacote_servico,
          report.ponto_entrada_servico,
          report.localizacao,
          report.data_servico,
          report.provedor,
          report.observacoes,
          report.servico_status,
        ];
        sequence++;
        worksheet.addRow(values);
      });

      const created = moment().format("YYYYMMDD_hhmmss");
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `DLT2.0_NOVAS_RAMJ_ VULNERABILIDADES_E_SERVICOS_${created}.xlsx`
      );

      setDataLoading(false);
    } catch (error) {
      // Handle any errors that occur during report generation
      console.error("Error generating XLSX report:", error);
      setDataLoading(false);
      // Display an error message using your preferred method (e.g., toast.error)
      toast.error("An error occurred during report generation.");
    }
  };

  const generateSummaryXlsReport = async () => {
    console.log("On Export XLS");

    try {
      setDataLoading(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        "DLT2.0_SUMARIO_NOVAS_RAMJ_ VULNERABILIDADES_E_SERVICOS"
      );

      worksheet.mergeCells("A1:AN1");

      worksheet.getCell("A1").value =
        "SUMARIO DE Novas RAMJ, Vulnerabilidades e Serviços ";

      worksheet.getCell("A3").value = "Data de Início";
      worksheet.getCell("A4").value = "Data de Fim";
      worksheet.getCell("B3").value = moment(initialDate).format("YYYY-MM-DD");
      worksheet.getCell("B4").value = moment(finalDate).format("YYYY-MM-DD");

      worksheet.getCell("A1").font = {
        family: 4,
        size: 11,
        underline: true,
        bold: true,
      };
      worksheet.getCell("A3").font = {
        family: 4,
        size: 11,
        underline: true,
        bold: true,
      };
      worksheet.getCell("A4").font = {
        family: 4,
        size: 11,
        underline: true,
        bold: true,
      };

      const headers = [
        "#",
        "Província",
        "Distrito",
        "NUI",
        "Idade Actual",
        "Faixa Actual",
        "Vulnerabilidades",
        "Agyw Prev",
        "Referencias Clinico",
        "Referencias Comunitario",
        "Recursos Sociais",
        "Data Recursos Sociais",
        "Prevencao HIV",
        "Data Prevencao HIV",
        "Prevencao VGB",
        "Data Prevencao VGB",
        "Educativas",
        "Data Educativas",
        "Literacia Financeira",
        "Data Literacia Financeira",
        "ATS",
        "Data ATS",
        "Preservativos",
        "Data Preservativos",
        "Contracepcao",
        "Data Contracepcao",
        "Abordagens Socio-Economicas",
        "Data Abordagens Socio-Economicas",
        "Subsidio Escolar",
        "Data Subsidio Escolar",
        "Cuidados Pos Violencia Comunitario",
        "Data Cuidados Pos Violencia Comunitarios",
        "Cuidados Pos Violencia Clinicos",
        "Data Cuidados Pos Violencia Clinicos",
        "Outros Saa",
        "Data Outros Saa",
        "Prep",
        "Data Prep",
      ];

      const headerRow = worksheet.getRow(6);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.value = header;
        cell.font = { bold: true };
      });

      // let sequence = 1;

      // for (let i = 0; i < lastPageSummary; i++) {
      //   const responseData = await getNewlyEnrolledAgywAndServicesSummary(
      //     districtsIds,
      //     initialDate,
      //     finalDate,
      //     i,
      //     pageSize
      //   );
      //   responseData.forEach((report) => {
      //     const values = [
      //       sequence,
      //       report[0],
      //       report[1],
      //       report[2],
      //       report[3],
      //       report[4],
      //       report[5],
      //       report[6],
      //       report[7],
      //       report[8],
      //       report[9],
      //       report[10],
      //       report[11],
      //       report[12],
      //       report[13],
      //       report[14],
      //       report[15],
      //       report[16],
      //       report[17],
      //       report[18],
      //       report[19],
      //       report[20],
      //       report[21],
      //       report[22],
      //       report[23],
      //       report[24],
      //       report[25],
      //       report[26],
      //       report[27],
      //       report[28],
      //       report[29],
      //       report[30],
      //       report[31],
      //       report[32],
      //       report[33],
      //       report[34],
      //       report[35],
      //       report[36],
      //       report[37],
      //     ];
      //     sequence++;
      //     worksheet.addRow(values);
      //   });
      // }

      const created = moment().format("YYYYMMDD_hhmmss");
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `DLT2.0_SUMARIO_NOVAS_RAMJ_ VULNERABILIDADES_E_SERVICOS_${created}.xlsx`
      );

      setDataLoading(false);
    } catch (error) {
      // Handle any errors that occur during report generation
      console.error("Error generating XLSX report:", error);
      setDataLoading(false);
      // Display an error message using your preferred method (e.g., toast.error)
      toast.error("An error occurred during report generation.");
    }
  };

  const handleChange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e: any) => {
      const data = JSON.parse(e?.target?.result);
      console.log("----uploading json----", data);
      setData(data);
    };
  };

  return (
    <Fragment>
      <AppTitle />
      <Card>
        <div style={{ textAlign: "center" }}>
          <Image
            width={150}
            preview={false}
            src={dreams}
            style={{ marginBottom: "10px" }}
          />
        </div>
        <Title
          level={3}
          style={{
            marginBottom: "10px",
            textAlign: "center",
            color: "#17a2b8",
          }}
        >
          EXTRAÇÃO DE DADOS
        </Title>
        <Card
          title="Parâmetros da extração"
          bordered={false}
          headStyle={{ color: "#17a2b8" }}
          style={{ color: "#17a2b8", marginLeft: "35%", marginRight: "20%" }}
        >
          <div style={{}}>
            <Form form={form} layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="province"
                    label="Provincia"
                    rules={[{ required: true, message: RequiredFieldMessage }]}
                  >
                    <Select
                      placeholder="Seleccione a Província"
                      onChange={onChangeProvinces}
                    >
                      {provinces?.map((item) => (
                        <Option key={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="districts"
                    label="Distritos"
                    rules={[{ required: true, message: RequiredFieldMessage }]}
                  >
                    <Select
                      mode="multiple"
                      disabled={districts == undefined}
                      onChange={onChangeDistricts}
                    >
                      {districts?.map((item) => (
                        <Option key={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="initialDate" label="Data Inicial">
                    <Space direction="vertical">
                      <DatePicker
                        onChange={(e) => {
                          setInitialDate(e?.toDate().getTime());
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item name="finalDate" label="Data Final">
                    <Space direction="vertical">
                      <DatePicker
                        onChange={(e) => {
                          setFinalDate(e?.toDate().getTime());
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item
                    name="Extração"
                    label="Extração"
                    rules={[{ required: true, message: RequiredFieldMessage }]}
                  >
                    <Select
                      placeholder="Seleccione a Extração Que Pretende"
                      onChange={(e) => setExtraOption(e)}
                    >
                      {extraOptions?.map((item) => (
                        <Option key={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={downloadJsonReport}
                    >
                      Extrair
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={generateXlsReport}
                    >
                      Exportar XLS
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Card>
      </Card>
      <Card>
        <strong>import gs-data.json</strong>
        <hr />
        <form
          onSubmit={() => {
            console.log("submiting");
          }}
        >
          <label>
            Name:
            <input
              type="file"
              id="input_json"
              // ref={fileRef}
              accept=".json,application/json"
              onChange={handleChange}
            />
          </label>
          <input type="submit" value="Execute Sync" />
        </form>
      </Card>
      {<LoadingModal modalVisible={dataLoading} />}
    </Fragment>
  );
};

export default DataExtraction;
