import ViewCount from '../models/viewCount.js';
import Names from '../constants/names.js';

export const getViews = async (req, res) => {
    try {
        const views = await ViewCount.findOne({ name: Names.view });
        res.status(200).json(views.count);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const addView = async (req, res) => {
    try {
        const views = await ViewCount.findOne({ name: Names.view });
        views.count = views.count + 1;
        await views.save();
        res.status(200).json(views.count);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}