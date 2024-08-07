'use client'
import { useAlert } from "@/lib/state/alert";
import { ActionIcon, Button, Card, Flex, Stack, Text, Textarea, Title } from "@mantine/core";
import { useDocumentVisibility, useLocalStorage, useShallowEffect } from "@mantine/hooks";
import MarkdownPreview from '@uiw/react-markdown-preview';
import _ from "lodash";
import { useState } from "react";
import { MdHorizontalSplit, MdRestore, MdVerticalSplit } from "react-icons/md";
import { revalidateTools } from "../_revalidate/tools";

export function ModulePage({ title, id, desc }: { title: string, desc: string, id: string }) {
    const visibility = useDocumentVisibility()
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useAlert()
    const [isRow, setIsRow] = useLocalStorage({
        key: "isRow",
        defaultValue: true
    })
    const [content, setContent] = useLocalStorage({
        key: "module_content_" + id,
        defaultValue: ""
    })

    const [result, setResult] = useLocalStorage({
        key: "module_result_" + id,
        defaultValue: ""
    })

    async function onRun() {
        if (_.isEmpty(content.trim())) return setAlert({
            message: "content is require",
            type: "error"
        })

        setLoading(true)
        const res = await fetch("/tools/api/completion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                content
            })
        })

        if (res.status !== 200) {
            setLoading(false)
            return setAlert({
                message: await res.text(),
                type: "error"
            })
        }

        setLoading(false)
        const json = await res.json()
        setResult(json)
    }

    function onReset() {
        setContent("")
        setResult("")
    }

    useShallowEffect(() => {
        if (visibility === "visible") {
            revalidateTools()
        }
    }, [visibility])

    // useShallowEffect(() => {
    //     if (visibility === "hidden") {
    //         console.log("hidden")
    //         setTimeout(() => {
    //             showNotification()
    //             console.log(Notification.permission, "notification dimunculkan")
    //         }, 2000)
    //     }
    // }, [visibility])

    // function showNotification() {
    //     if (Notification.permission === "granted") {
    //         console.log("show notification")
    //         return new Notification("notification", {
    //             body: "apa kabarnya"
    //         })
    //     }

    //     console.log(Notification.permission)
    // }

    return <Stack pos={"relative"}>
        {/* <Button onClick={showNotification}>notification</Button> */}
        <Flex justify={"space-between"} p={"xs"} bg={"dark"} gap={"md"} pos={"sticky"} top={0} style={{
            zIndex: 999
        }}>
            <Title c={"white"} order={4}>{title}</Title>
            <Flex gap={"md"}>
                <ActionIcon onClick={() => setIsRow(r => !r)}>
                    {isRow ? <MdHorizontalSplit /> : <MdVerticalSplit />}
                </ActionIcon>
                <ActionIcon onClick={onReset}>
                    <MdRestore />
                </ActionIcon>
            </Flex>
        </Flex>
        <Flex flex={1} direction={isRow ? "row" : "column"}>
            <Stack flex={1} p={"xs"}>
                <Title order={5}>content</Title>
                <Card withBorder >
                    <Text c={"gray"}>{desc}</Text>
                </Card>
                <Textarea styles={{
                    input: {
                        backgroundColor: "whitesmoke",
                        height: 500
                    }
                }} placeholder="content" minRows={20} maxRows={60} value={content} onChange={(e) => setContent(e.currentTarget.value)} />
                <Flex justify={"end"}>
                    <Button loading={loading} onClick={onRun}>RUN</Button>
                </Flex>
            </Stack>
            <Stack flex={1} p={"xs"} >
                <Title order={5}>result</Title>
                <MarkdownPreview source={result} style={{ padding: 16 }} />
            </Stack>
        </Flex>
    </Stack>
}