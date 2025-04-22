import React, { Key, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Modal, Space, Switch, Table, Tooltip, Tree } from 'antd';
import type { ScheduleTask } from '../types.ts';
import { examCategoryService } from '../services/api.ts';

interface DataNode {
    title: string;
    key: number;
    isLeaf?: boolean;
    children?: DataNode[];
}

// It's just a simple demo. You can use tree map to optimize update perf.
const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[], level: number): DataNode[] =>
    list.map((node) => {
        if (node.key === key) {
            if (level === 2) {
                return {
                    ...node,
                    children: children.map((child) => ({
                        ...child,
                        isLeaf: true,
                    })),
                };
            }
            return {
                ...node,
                children,
            };
        }
        if (node.children) {
            return {
                ...node,
                children: updateTreeData(node.children, key, children, level + 1),
            };
        }
        return node;
    });

const ExamCategoryTree: React.FC = () => {
    const [treeData, setTreeData] = useState([] as DataNode[]);
    const [open, setOpen] = useState(false);
    const [selectedPaperType, setSelectedPaperType] = useState(null as Key | null);
    const [treeLabelData, setTreeLabelData] = useState([] as DataNode[]);

    useEffect(() => {
        examCategoryService.find_exam_by_pid().then((resp) => {
            const treeData = resp.data.map(exam => ({
                key: exam.id,
                title: exam.name
            }) as DataNode);
            setTreeData(treeData);
        });
    }, []);

    const onLoadData = ({ key, children }: any) =>
        new Promise<void>((resolve) => {
            if (children) {
                resolve();
                return;
            }
            examCategoryService.find_exam_by_pid(key).then((resp) => {
                const children = resp.data.map(exam => ({
                    key: exam.id,
                    title: exam.name
                }) as DataNode);

                setTreeData((origin) =>
                    updateTreeData(origin, key, children, 0),
                );

                resolve();
            });
        });

    const onLoadLabelData = ({ key, children }: any) =>
        new Promise<void>((resolve) => {
            if (children) {
                resolve();
                return;
            }
            if (!selectedPaperType) {
                return;
            }
            examCategoryService.find_label_by_pid(selectedPaperType as number, key).then((resp) => {
                const children = resp.data.map(exam => ({
                    key: exam.id,
                    title: exam.name
                }) as DataNode);

                setTreeLabelData((origin) =>
                    updateTreeData(origin, key, children, 0),
                );

                resolve();
            });
        });

    const handleSelect = (selectedKeys: Key[]) => {
        if (selectedKeys.length === 0) {
            setOpen(false);
            return;
        }
        const paperType = selectedKeys[0];
        setSelectedPaperType(paperType);
        examCategoryService.find_label_by_pid(paperType as number, 0).then((resp) => {
            const treeData = resp.data.map(exam => ({
                key: exam.id,
                title: exam.name
            }) as DataNode);
            setTreeLabelData(treeData);
            setOpen(true);
            console.log('selected', selectedKeys);
        });
    };

    return (
        <>
            <Tree loadData={onLoadData} treeData={treeData} onSelect={handleSelect} showLine />
            <Modal
                title="Label"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <Tree loadData={onLoadLabelData} treeData={treeLabelData} showLine />
            </Modal>
        </>
    );
}

export default ExamCategoryTree;