import {
  Button,
  Input,
  message,
  Modal,
  notification,
  Table,
  TableProps,
  Tabs,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {
  PlusOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  BlockOutlined,
} from '@ant-design/icons';
import { columns } from './constant';
import { MailInfo, ResGetMail } from '../../models/mail';
import { FormImportMail } from '../../components/form-add-mail/form-import-mail';
import { FormUploadVideo } from '../../components/form-upload-video';
import { UploadVideoArgs } from '../../models/upload-video';

type ActionMailTable = {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (record: MailInfo) => void;
};

export const ManageMail = () => {
  const [dataTable, setDataTable] = useState<MailInfo[]>([]);
  const [isOpenAddMailModal, setIsOpenAddMailModal] = useState(false);
  const [isOpenAddVideoChannelModal, setIsOpenAddVideoChannelModal] =
    useState(false);
  const [selectMail, setSelectMail] = useState<MailInfo>();
  const [api, contextHolder] = notification.useNotification();
  const [reloadData, setReloadData] = useState(0);
  const [resetUploadVideoForm, setResetUploadVideoForm] = useState(0);
  const [listSelectedMail, setListSelectedMail] = useState<MailInfo[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>();
  const [isMultipleUpload, setIsMultipleUpload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: MailInfo[]) => {
      setListSelectedMail(selectedRows);
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const actionColumns: TableProps<MailInfo>['columns'] = [
    ...(columns as any),
    {
      title: 'Tiện ích',
      width: 200,
      render: (_, record) => (
        <div className="flex gap-4 ">
          {actionList.map((action, index) => (
            <Tooltip title={action.tooltip} key={index}>
              <div
                key={index}
                onClick={() => action.onClick(record)}
                className="py-1 px-2 text-lg rounded-full cursor-pointer hover:bg-zinc-100 active:bg-zinc-300 transition-all"
              >
                {action.icon}
              </div>
            </Tooltip>
          ))}
        </div>
      ),
    },
  ];

  const deleteMail = (mailInfo: MailInfo) => {
    window.electron.ipcRenderer.sendMessage('delete-mail', mailInfo);
  };

  const actionList: Array<ActionMailTable> = [
    {
      icon: <PlayCircleOutlined className="text-green-500" />,
      tooltip: 'Tải video lên kênh',
      onClick: (record?: MailInfo) => {
        setSelectMail(record);
        setIsOpenAddVideoChannelModal(true);
      },
    },
    // {
    //   icon: <EditOutlined className="text-yellow-600" />,
    //   tooltip: 'Chỉnh sửa thông tin',
    //   onClick: (record?: MailInfo) => {},
    // },
    // {
    //   icon: <DeleteOutlined className="text-red-600" />,
    //   tooltip: 'Xóa mail',
    //   onClick: (record: MailInfo) => {
    //     deleteMail(record);
    //   },
    // },
  ];

  const getListMail = (currentPage: number, pageSize: number) => {
    setIsLoading(true);
    window.electron.ipcRenderer.sendMessage('get-list-mail', {
      currentPage,
      pageSize,
    });
  };

  useEffect(() => {
    getListMail(currentPage, pageSize);
  }, [reloadData, currentPage, pageSize]);

  useEffect(() => {
    const removeGetListMailEvent = window.electron.ipcRenderer.on(
      'get-list-mail',
      (res) => {
        const response = res as ResGetMail;
        setDataTable(response.mails);
        setTotalPages(response.totalMails);
        setIsLoading(false);
      },
    );

    const removeDeleteMailEvent = window.electron.ipcRenderer.on(
      'delete-mail',
      () => {
        setReloadData((prev) => prev + 1);
      },
    );

    const removeReloadListEvent = window.electron.ipcRenderer.on(
      'reload-list-mail',
      () => {
        setReloadData((prev) => prev + 1);
      },
    );

    return () => {
      removeGetListMailEvent();
      removeDeleteMailEvent();
      removeReloadListEvent();
    };
  }, []);

  const uploadVideo = (channelName: string) => {
    window.electron.ipcRenderer.sendMessage('upload-video', {
      mail: selectMail,
      channelName: channelName,
    } as UploadVideoArgs);
  };

  useEffect(() => {
    const removeListenEventUploadVideo = window.electron.ipcRenderer.on(
      'upload-video',
      (res) => {
        const responseContent = res as any;
        api.info({
          message: responseContent.message,
          placement: 'bottomRight',
        });
      },
    );
    return () => {
      removeListenEventUploadVideo();
    };
  }, []);

  useEffect(() => {
    setResetUploadVideoForm((prev) => prev + 1);
  }, [isOpenAddVideoChannelModal]);

  return (
    <div className="flex-1 h-full p-4 overflow-auto">
      {contextHolder}
      <Modal
        title="Thêm dữ liệu mail"
        open={isOpenAddMailModal}
        onCancel={() => setIsOpenAddMailModal(false)}
        footer={<></>}
      >
        <Tabs
          items={[
            {
              label: 'Thêm nhiều mail',
              children: (
                <FormImportMail
                  onUploadedFile={() => {
                    setReloadData((prev) => prev + 1);
                    setIsOpenAddMailModal(false);
                  }}
                />
              ),
              key: 'importMail',
            },
            {
              label: 'Thêm một mail',
              children: <></>,
              key: 'singleMail',
            },
          ]}
        />
      </Modal>
      <Modal
        title="Thêm video vào kênh"
        open={isOpenAddVideoChannelModal}
        onCancel={() => {
          setIsOpenAddVideoChannelModal(false);
          setIsMultipleUpload(false);
        }}
        footer={<></>}
        className="w-[700px]"
      >
        <FormUploadVideo
          mailInfo={selectMail}
          onDeny={() => {
            setSelectMail(undefined);
            setIsOpenAddVideoChannelModal(false);
          }}
          onSubmit={(channelName) => {
            uploadVideo(channelName);
            setIsOpenAddVideoChannelModal(false);
          }}
          isReset={resetUploadVideoForm}
          multipleUpload={isMultipleUpload}
          listMail={listSelectedMail}
        />
      </Modal>
      <div className="w-fit mx-auto">
        <h1 className="text-3xl font-medium mb-10 bg-gradient-to-r from-red-600 to-orange-600 inline-block text-transparent bg-clip-text pb-1">
          Quản lý mail
        </h1>
      </div>
      <div className="flex">
        <div className="w-64 mb-2">
          <Input.Search
            placeholder="Tìm kiếm bằng tên mail"
            inputMode="email"
            allowClear
            enterButton
          />
        </div>
        <div className="w-fit ml-auto flex gap-2 items-center">
          <Button
            icon={<BlockOutlined className="text-lg" />}
            onClick={() => {
              if (listSelectedMail.length < 1) {
                message.info(
                  'Vui lòng chọn danh sách mail muốn tải video lên!',
                );
              } else {
                setIsMultipleUpload(true);
                setIsOpenAddVideoChannelModal(true);
              }
            }}
          >
            Up video nhiều mail
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsOpenAddMailModal(true)}
          >
            Thêm mail
          </Button>
        </div>
      </div>
      <div className="">
        <Table
          loading={isLoading}
          columns={actionColumns}
          dataSource={dataTable}
          rowSelection={{
            ...rowSelection,
            selectedRowKeys,
          }}
          scroll={{ y: 450 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalPages,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `Hiển thị ${range[0]} - ${range[1]} của ${total} mails`,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </div>
    </div>
  );
};
