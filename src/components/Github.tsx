import { useEffect } from "react"

export type GithubProps = {
    owner: string
    token: string
}

export type createRepositoryProps = {
    name: string
    description: string
    homepage: string
    private: boolean
    auto_init: boolean
}

export type listRepositoryProps = {
    type: 'all' | 'owner' | 'public' | 'private' | 'member'
    sort: 'created' | 'updated' | 'pushed' | 'full_name'
    direction: 'asc' | 'desc'
    per_page: number
    page: number
}

const Github = (prop?: GithubProps) => {

    const { owner, token } = prop || {
        owner: 'weizuxiao911',
        token: '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'
    }

    useEffect(() => {

        repsitory.list().then(async res => {
            console.log(await res.json())
        }).catch(error => {
            console.error(error)
        })

    }, [])

    const repsitory = {
        create: async (props: createRepositoryProps): Promise<Response> => {
            return fetch(`https://api.github.com/user/repos`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(props)
            })
        },

        list: async (props?: listRepositoryProps): Promise<Response> => {
            return fetch(`https://api.github.com/user/repos?type=${props?.type ?? 'owner'}&sort=${props?.sort ?? 'updated'}&direction=${props?.direction ?? 'desc'}&page=${props?.page ?? 1}&per_page=${props?.per_page ?? 30}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        },

        content: async (props: any): Promise<Response> => {
            return fetch(`https://api.github.com/user/repos?type=${props?.type ?? 'owner'}&sort=${props?.sort ?? 'updated'}&direction=${props?.direction ?? 'desc'}&page=${props?.page ?? 1}&per_page=${props?.per_page ?? 30}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        },
    }

    return {
        repsitory
    }

}

export default Github