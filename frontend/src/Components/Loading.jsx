import { motion } from "framer-motion";

const loadingContainer = {
	width: "4rem",
	height: "4rem",
	display: "flex",
	justifyContent: "space-around",
};
const loadingCircle = {
	display: "block",
	width: "1rem",
	height: "1rem",
	backgroundColor: "#ff7f27",
	borderRadius: "0.5rem",
};

const loadingContainerVariants = {
	start: {
		transition: {
			staggerChildren: 0.15,
		},
	},
	end: {
		transition: {
			staggerChildren: 0.15,
		},
	},
};

const loadingCircleVariants = {
	start: {
		y: "0%",
	},
	end: {
		y: "50%",
	},
};
const loadingCircleTransition = {
	duration: 1,
	repeat: Infinity,
	ease: "easeInOut",
};

const Loading = () => {
	return (
		<div>
			<div className="fixed w-full min-h-screen z-50 bg-white">
				<div className="flex fixed w-full justify-center items-center h-screen">
					<motion.div
						style={loadingContainer}
						variants={loadingContainerVariants}
						initial="start"
						animate="end"
					>
						<motion.span
							style={loadingCircle}
							variants={loadingCircleVariants}
							transition={loadingCircleTransition}
						></motion.span>
						<motion.span
							style={loadingCircle}
							variants={loadingCircleVariants}
							transition={loadingCircleTransition}
						></motion.span>
						<motion.span
							style={loadingCircle}
							variants={loadingCircleVariants}
							transition={loadingCircleTransition}
						></motion.span>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Loading;
