import ModuleEditor from "./components/module-editor"

const text =`---
title: 测试
author: weizuxiao
---

# h1

3333

`

const Home = () => {
    return <ModuleEditor text={text}/>
}

export default Home