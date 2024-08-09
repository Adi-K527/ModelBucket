import express, { request } from "express"
import fetch from "node-fetch"

const router = express.Router()

router.post("/", async (req, res) => {
    let id = req.body.id

    try {
        await fetch('https://api.github.com/repos/Adi-K527/ModelBucket/actions/workflows/deploymodel.yaml/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main'
            })
        });
    }
    catch (error) {
        console.error(error)
    }

    res.status(200).json({"message": req.body, "id": id})
})

export default router