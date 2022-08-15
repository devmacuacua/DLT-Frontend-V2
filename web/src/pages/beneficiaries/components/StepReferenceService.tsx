import React, { Fragment, useEffect, useState } from 'react';
import { Badge, Button, Steps, Row, Col, Input, message, InputNumber, Form, DatePicker, Checkbox, Select, Radio, Divider, SelectProps, Card, Table, Typography, Space, Drawer } from 'antd';
import './index.css';
import moment from 'moment';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { query as queryUser,userById, allUsesByUs } from '@app/utils/users';
import { query as queryBeneficiary } from "@app/utils/beneficiary";
import { queryByType } from '@app/utils/service'

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const { Text } = Typography;

const options = [
  { label: 'US', value: '1' },
  { label: 'CM', value: '2' },
  { label: 'ES', value: '3' },
];

const StepReferenceService = ({ form, reference, beneficiary }: any) => {

    const selectedIntervention = beneficiary?.beneficiariesInterventionses;

    const [user, setUser] = React.useState<any>();

    const [visible, setVisible] = useState<boolean>(false);
    const [services, setServices] = useState<any>([]);
    const [servicesList, setServicesList] = useState<any>();
    const [interventions, setInterventions] = useState<any>();
    const [selectedService, setSelectedService] = useState<any>();

    const showDrawer = (record: any) => {

        setVisible(true);
    };

    useEffect(() => {

      const fetchData = async () => {
        const data = await queryUser(beneficiary?.createdBy);
        const data1 = await queryBeneficiary(beneficiary.id);

        if(reference !== undefined){
            const getAllData = await queryByType(reference?.serviceType);
            setServicesList(getAllData);
        }

        setUser(data);
        setInterventions(data1.beneficiariesInterventionses);
      } 
  
          if(selectedIntervention !== undefined){
  
          fetchData().catch(error => console.log(error));
        }    
    
    }, [reference]);  

    const onRemoveServico = (value:any) => { 
        
        setServices(services.filter((v, i) => i !== services.indexOf(value)));
        
        message.warning({
            content: value.name+' foi removido da lista de serviços a serem providos.', className: 'custom-class',
            style: {
                marginTop: '10vh',
            }
        });
    }

    const onAddService = () => {

        form.validateFields().then(async (values) => {

            const newServices = [selectedService, ...services];
            var serv = newServices.filter((v, i) => newServices.indexOf(v) === i);
            setServices(serv);

            setVisible(false);

            message.success({
                content: 'Adicionado com Sucesso!', className: 'custom-class',
                style: {
                    marginTop: '10vh',
                }
            });
            
        })
        .catch(error => {
            message.error({
                content: 'Nenhum Serviço selecionado!', className: 'custom-class',
                style: {
                    marginTop: '10vh',
                }
            });
        });

        setSelectedService(undefined);
        form.setFieldValue('service', undefined);
        form.setFieldValue('outros', '');
    }
       
    const onChangeServico = async (value:any) => { 
        let serv = servicesList.filter(item => {return item.id == value})[0];
        setSelectedService(serv);
    }
      
    const onClose = () => {
        setVisible(false);
        setSelectedService(undefined);
        form.setFieldValue('service', '');
        form.setFieldValue('outros', '');        
    };

    const servicesColumns = [
      { title: '#', 
          dataIndex: 'order', 
          key: 'order',
          render: (text, record) => services.indexOf(record) + 1,
      },
     
      { title: 'Serviço', 
          dataIndex: '', 
          key: 'service',
          render: (text, record)  => record.name,
      },
      { title: 'Accao', 
          dataIndex: '', 
          key: 'intervention',
          render: (text, record)  => 
            
            <Button type='primary' icon={<DeleteFilled  />} onClick={() => onRemoveServico(record)} danger>
            </Button> 
          ,
      },
  ];

  const interventionColumns = [
      { title: 'Data', 
          dataIndex: 'date', 
          key: 'date',
          render: (text, record) => <span>{moment(record.id.date).format('YYYY-MM-DD')}</span>,
      },
      { title: 'Serviço', 
          dataIndex: '', 
          key: 'service',
          render: (text, record)  => record.subServices.service.name,
      },
      { title: 'Intervenções', 
          dataIndex: '', 
          key: 'intervention',
          render: (text, record)  => record.subServices.name,
      },
      { title: 'Atendido Por', 
          dataIndex: '', 
          key: 'provider',
          render: (text, record)  => record.provider,
      }
  ];

    return (
      <>
        <div className="site-drawer-render-in-current-wrapper">
            <Card 
                bordered={false} 
                bodyStyle={{ margin: 0, marginBottom: "20px", padding: 0 }}
            >
                <Row gutter={24}>
                    <Col className="gutter-row" span={24}>
                        <Card 
                            title={reference?.referenceNote + ' | ' + beneficiary?.neighborhood.locality.district.code + '/' + beneficiary?.nui}
                            bordered={true}
                            headStyle={{ background: "#17a2b8"}}
                            bodyStyle={{ paddingLeft: "10px", paddingRight: "10px", height: "120px" }}
                        >
                            <Row>
                                <Col className="gutter-row" span={3}><b>Data Registo</b></Col>
                                <Col className="gutter-row" span={5}><b>Referente</b></Col>
                                <Col className="gutter-row" span={3}><b>Contacto</b></Col>
                                <Col className="gutter-row" span={3}><b>No do Livro</b></Col>
                                <Col className="gutter-row" span={4}><b>Organização</b></Col>
                                <Col className="gutter-row" span={3}><b>Cod Referências</b></Col>
                                <Col className="gutter-row" span={3}><b>Tipo Serviço</b></Col>
                            </Row>
                            <hr style={{
                                background: 'gray',
                                height: '1px',
                                }}/>
                            <Row>
                                <Col className="gutter-row" span={3}>{moment(reference?.dateCreated).format('YYYY-MM-DD HH:MM')}</Col>
                                <Col className="gutter-row" span={5}>{user?.name+' '+user?.surname}</Col>
                                <Col className="gutter-row" span={3}>{user?.phoneNumber}</Col>
                                <Col className="gutter-row" span={3}>{reference?.bookNumber}</Col>
                                <Col className="gutter-row" span={4}>{user?.partners.name}</Col>
                                <Col className="gutter-row" span={3}>{reference?.referenceCode}</Col>
                                <Col className="gutter-row" span={3}>{reference?.serviceType=='CLINIC'? 'Serviços Clínicos': 'Serviços Comunitários'}</Col>
                            
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Card>
            <Card 
                bordered={false} 
                bodyStyle={{ margin: 0, marginBottom: "20px", padding: 0 }}
            >
                <Row gutter={24}>
                    <Col className="gutter-row" span={12}>
                        <Card 
                            title='Serviços Solicitados'
                            bordered={true}
                            headStyle={{ background: "#17a2b8"}}
                            bodyStyle={{ paddingLeft: "10px", paddingRight: "10px" }}
                            extra={
                                <Button type="primary" onClick={() => showDrawer(user)} icon={<PlusOutlined />}  >
                                    Intervenção
                                </Button>}
                        >
                            <Table
                                rowKey="id"
                                columns={servicesColumns}
                                dataSource={services}
                                pagination={false}
                            />
                        </Card>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Card 
                            title={`Intervenções Recebidas`}
                            bordered={true}
                            headStyle={{ background: "#17a2b8"}}
                            bodyStyle={{ paddingLeft: "10px", paddingRight: "10px" }}
                        >
                            <Table
                                rowKey={( record? ) => `${record.id.subServiceId}${record.id.date}`}                                
                                columns={interventionColumns}
                                dataSource={interventions}
                                bordered
                                pagination={false}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>
            <Drawer
                title="Adicionar Serviço Dreams"
                placement="top"
                onClose={onClose}
                visible={visible}
                getContainer={false}
                style={{ position: 'absolute' }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button htmlType="submit" onClick={() => onAddService()} type="primary">
                            Submit
                        </Button>
                    </Space>
                }
            >
                    <>
                        <Row gutter={8}>              
                        <Col span={8}>
                            <Form.Item
                            name="service"
                            label="Serviço Referido"
                            rules={[{ required: true, message: 'Obrigatório' }]}
                            >
                            <Select placeholder="Selecione um Serviço" onChange={onChangeServico}>
                                    {servicesList?.map(item => (
                                        <Option key={item.id}>{item.name}</Option>
                                    ))}
                            </Select>
                            </Form.Item>
                        </Col>
                        
                        <Col span={8}>
                            <Form.Item
                            name="outros"
                            label="Observações"
                            >
                            <TextArea rows={2} placeholder="Insira as Observações" maxLength={50} />
                            </Form.Item>
                        </Col>
                        </Row>
                    </>  
            </Drawer>                
        </div>
    </>
    );
}
export default StepReferenceService;