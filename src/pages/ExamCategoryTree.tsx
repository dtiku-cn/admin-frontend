import { Modal, Segmented, Tree } from 'antd';
import React, { Key, useEffect, useState } from 'react';
import { examCategoryService, KeyPointService } from '../services/api.ts';

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
    const [modelQueryType, setModelQueryType] = useState("label");
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
            if (modelQueryType == "label") {
                examCategoryService.find_label_by_pid(selectedPaperType as number, key).then((resp) => {
                    const children = resp.data.map(exam => ({
                        key: exam.id,
                        title: exam.name,
                        disabled: exam.hidden
                    }) as DataNode);

                    setTreeLabelData((origin) =>
                        updateTreeData(origin, key, children, 0),
                    );

                    resolve();
                });
            } else if (modelQueryType == "key-point") {
                KeyPointService.find_by_pid(selectedPaperType as number, key).then((resp) => {
                    const children = resp.data.map(kp => ({
                        key: kp.id,
                        title: kp.name
                    }) as DataNode);

                    setTreeLabelData((origin) =>
                        updateTreeData(origin, key, children, 0),
                    );

                    resolve();
                });
            }
        });

    const handleSelect = (selectedKeys: Key[]) => {
        if (selectedKeys.length === 0) {
            setOpen(false);
            return;
        }
        const paperType = selectedKeys[0];
        setSelectedPaperType(paperType);
        queryModalTree(modelQueryType, paperType as number);
    };

    const queryModalTree = (modelQueryType: string, paperType: number) => {
        if (modelQueryType == "label") {
            examCategoryService.find_label_by_pid(paperType, 0).then((resp) => {
                const treeData = resp.data.map(exam => ({
                    key: exam.id,
                    title: exam.name
                }) as DataNode);
                setTreeLabelData(treeData);
                setOpen(true);
            });
        } else if (modelQueryType == "key-point") {
            KeyPointService.find_by_pid(paperType, 0).then((resp) => {
                const treeData = resp.data.map(kp => ({
                    key: kp.id,
                    title: kp.name
                }) as DataNode);
                setTreeLabelData(treeData);
                setOpen(true);
            });
        }
    }

    const handleModelQueryChange = (value: string) => {
        queryModalTree(value, selectedPaperType as number);
        setModelQueryType(value);
    }

    return (
        <>
            <Tree loadData={onLoadData} treeData={treeData} onSelect={handleSelect} showLine />
            <Modal
                title={<Segmented
                    options={["label", "key-point"]}
                    value={modelQueryType}
                    onChange={handleModelQueryChange}
                />}
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